package com.aayush.blackjack.payment.service;

import com.aayush.blackjack.config.RazorpayConfig;
import com.aayush.blackjack.notification.dto.NotificationRequest;
import com.aayush.blackjack.notification.enums.NotificationTemplate;
import com.aayush.blackjack.notification.service.NotificationService;
import com.aayush.blackjack.payment.dto.CreatePaymentOrderRequest;
import com.aayush.blackjack.payment.dto.CreatePaymentOrderResponse;
import com.aayush.blackjack.payment.dto.PaymentVerificationResponse;
import com.aayush.blackjack.payment.dto.VerifyPaymentRequest;
import com.aayush.blackjack.payment.entity.PaymentAttempt;
import com.aayush.blackjack.payment.entity.Purchase;
import com.aayush.blackjack.payment.entity.WebhookEvent;
import com.aayush.blackjack.payment.enums.PaymentStatus;
import com.aayush.blackjack.payment.enums.PurchaseStatus;
import com.aayush.blackjack.payment.repository.PaymentAttemptRepository;
import com.aayush.blackjack.payment.repository.PurchaseRepository;
import com.aayush.blackjack.payment.repository.WebhookEventRepository;
import com.aayush.blackjack.plan.entity.ChipPlan;
import com.aayush.blackjack.plan.repository.ChipPlanRepository;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.repository.UserRepository;
import com.aayush.blackjack.wallet.entity.ChipTransaction;
import com.aayush.blackjack.wallet.entity.ChipWallet;
import com.aayush.blackjack.wallet.enums.TransactionType;
import com.aayush.blackjack.wallet.repository.ChipTransactionRepository;
import com.aayush.blackjack.wallet.repository.ChipWalletRepository;
import com.aayush.blackjack.wallet.service.WalletService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class RazorpayPaymentService implements PaymentService {

    private static final String CURRENCY_INR = "INR";

    private final RazorpayClient razorpayClient;
    private final RazorpayConfig razorpayConfig;

    private final UserRepository userRepository;
    private final ChipPlanRepository chipPlanRepository;
    private final PurchaseRepository purchaseRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final ChipWalletRepository chipWalletRepository;
    private final ChipTransactionRepository chipTransactionRepository;
    private final WebhookEventRepository webhookEventRepository;
    private final NotificationService notificationService;
    private final PaymentIdempotencyService paymentIdempotencyService;

    @Override
    @Transactional
    public CreatePaymentOrderResponse pay(UUID userId, CreatePaymentOrderRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "User Not Found"));

        ChipPlan plan = chipPlanRepository.findById(request.planId()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan Not Found"));

        if (Boolean.FALSE.equals(plan.getActive())){
            throw new IllegalArgumentException("Plan is not active");
        }

        long effectivePriceInPaise = plan.getEffectivePrice();
        if (effectivePriceInPaise <= 0L) {
            throw new IllegalArgumentException("Invalid plan price");
        }

        long bonus = plan.getBonusChips() != null ? plan.getBonusChips() : 0L;
        long totalChips = plan.getChips() + bonus;

        Purchase purchase = new Purchase();
        purchase.setUser(user);
        purchase.setPlan(plan);
        purchase.setPlanName(plan.getName());
        purchase.setChipsAwarded(totalChips);
        purchase.setAmountInPaise(effectivePriceInPaise);
        purchase.setStatus(PurchaseStatus.PENDING);
        Purchase savedPurchase = purchaseRepository.saveAndFlush(purchase);

        try{
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", effectivePriceInPaise);
            orderRequest.put("currency", CURRENCY_INR);
            orderRequest.put("receipt", savedPurchase.getId().toString());
            orderRequest.put("notes", new JSONObject()
                    .put("purchaseId", savedPurchase.getId().toString())
                    .put("planId", plan.getId().toString())
                    .put("userId", user.getId().toString()));

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            PaymentAttempt paymentAttempt = new PaymentAttempt();
            paymentAttempt.setPurchase(savedPurchase);
            paymentAttempt.setRazorpayOrderId(razorpayOrderId);
            paymentAttempt.setAmountInPaise(effectivePriceInPaise);
            paymentAttempt.setStatus(PaymentStatus.PENDING);
            paymentAttemptRepository.save(paymentAttempt);

            return CreatePaymentOrderResponse.builder()
                    .purchaseId(savedPurchase.getId())
                    .razorpayOrderId(razorpayOrderId)
                    .amountInPaise(effectivePriceInPaise)
                    .currency(CURRENCY_INR)
                    .keyId(razorpayConfig.getKeyId())
                    .planName(plan.getName())
                    .chipsAwarded(totalChips)
                    .build();
        } catch (RazorpayException ex) {
            savedPurchase.setStatus(PurchaseStatus.FAILED);
            purchaseRepository.save(savedPurchase);
            throw new IllegalStateException("Failed to create Razorpay order", ex);
        }
    }

    @Override
    @Transactional
    public PaymentVerificationResponse verifyPayment(UUID userId, VerifyPaymentRequest request) {
        String idempotencyKey = paymentIdempotencyService.buildVerifyKey(
                userId,
                request.razorpayOrderId(),
                request.razorpayPaymentId()
        );

        Optional<PaymentVerificationResponse> cached = paymentIdempotencyService.getCached(idempotencyKey);
        if (cached.isPresent()) {
            return cached.get();
        }

        PaymentAttempt attempt = paymentAttemptRepository.findByRazorpayOrderId(request.razorpayOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "PaymentAttempt not found for order: " + request.razorpayOrderId()));

        Purchase purchase = attempt.getPurchase();
        if (!purchase.getUser().getId().equals(userId)) {
            throw new SecurityException("Purchase does not belong to current user");
        }

        try{
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.razorpayOrderId());
            attributes.put("razorpay_signature", request.razorpaySignature());
            attributes.put("razorpay_payment_id", request.razorpayPaymentId());

            boolean isValid = Utils.verifyPaymentSignature(attributes, razorpayConfig.getKeySecret());
            if (!isValid) {
                attempt.setStatus(PaymentStatus.FAILED);
                purchase.setStatus(PurchaseStatus.FAILED);
                paymentAttemptRepository.save(attempt);
                purchaseRepository.save(purchase);
                throw new IllegalArgumentException("Invalid Razorpay payment signature");
            }
        } catch (RazorpayException ex) {
            throw new IllegalArgumentException("Signature verification failed", ex);
        }

        attempt.setRazorpayPaymentId(request.razorpayPaymentId());
        attempt.setRazorpaySignature(request.razorpaySignature());
        settlePurchaseAsSuccess(purchase, attempt);

        PaymentVerificationResponse response = PaymentVerificationResponse.builder()
                .purchaseId(purchase.getId())
                .status(purchase.getStatus().name())
                .chipsAwarded(purchase.getChipsAwarded())
                .build();

        runAfterCommit(() -> paymentIdempotencyService.cache(idempotencyKey, response));

        return response;
    }

    @Override
    @Transactional
    public void handleWebhook(String rawPayload, String signatureHeader, String eventId) {
        try {
            boolean validSig = Utils.verifyWebhookSignature(
                    rawPayload,
                    signatureHeader,
                    razorpayConfig.getWebhookSecret()
            );
            if (!validSig) {
                throw new IllegalArgumentException("Invalid Razorpay webhook signature");
            }
        } catch (RazorpayException ex) {
            throw new IllegalArgumentException("Webhook signature verification error", ex);
        }

        if (eventId != null && !eventId.isBlank() && webhookEventRepository.existsByEventId(eventId)) {
            return;
        }

        JSONObject root = new JSONObject(rawPayload);
        String eventType = root.optString("event", "UNKNOWN");

        WebhookEvent webhookEvent = new WebhookEvent();
        webhookEvent.setEventId(eventId != null && !eventId.isBlank() ? eventId : UUID.randomUUID().toString());
        webhookEvent.setEventType(eventType);
        webhookEvent.setPayload(rawPayload);
        webhookEvent.setProcessed(false);
        WebhookEvent savedEvent = webhookEventRepository.saveAndFlush(webhookEvent);

        JSONObject payloadObj = root.optJSONObject("payload");
        JSONObject paymentEntity = payloadObj != null
                ? payloadObj.optJSONObject("payment") != null
                ? payloadObj.getJSONObject("payment").optJSONObject("entity")
                : null
                : null;

        String orderId = paymentEntity != null ? paymentEntity.optString("order_id", null) : null;
        String paymentId = paymentEntity != null ? paymentEntity.optString("id", null) : null;

        if (orderId != null && !orderId.isBlank()) {
            paymentAttemptRepository.findByRazorpayOrderId(orderId).ifPresent(attempt -> {
                Purchase purchase = attempt.getPurchase();
                if ("payment.captured".equals(eventType) || "order.paid".equals(eventType)) {
                    if (paymentId != null) {
                        attempt.setRazorpayPaymentId(paymentId);
                    }
                    settlePurchaseAsSuccess(purchase, attempt);
                } else if ("payment.failed".equals(eventType)) {
                    if (purchase.getStatus() != PurchaseStatus.SUCCESS) {
                        attempt.setStatus(PaymentStatus.FAILED);
                        purchase.setStatus(PurchaseStatus.FAILED);
                        paymentAttemptRepository.save(attempt);
                        purchaseRepository.save(purchase);
                    }
                }
            });
        }

        savedEvent.setProcessed(true);
        webhookEventRepository.save(savedEvent);
    }

    private void settlePurchaseAsSuccess(Purchase rawPurchase, PaymentAttempt attempt) {
        Purchase lockedPurchase = purchaseRepository.findByIdForUpdate(rawPurchase.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase Not Found"));

        if (lockedPurchase.getStatus() == PurchaseStatus.SUCCESS) {
            attempt.setStatus(PaymentStatus.SUCCESS);
            paymentAttemptRepository.save(attempt);
            return;
        }

        String referenceKey = "txn:purchase:" + lockedPurchase.getId();
        if (chipTransactionRepository.existsByReferenceKey(referenceKey)) {
            attempt.setStatus(PaymentStatus.SUCCESS);
            lockedPurchase.setStatus(PurchaseStatus.SUCCESS);
            paymentAttemptRepository.save(attempt);
            purchaseRepository.save(lockedPurchase);
            return;
        }

        attempt.setStatus(PaymentStatus.SUCCESS);
        lockedPurchase.setStatus(PurchaseStatus.SUCCESS);

        User user = lockedPurchase.getUser();
        ChipWallet wallet = chipWalletRepository.findLockedByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User wallet Not Found"));

        long updatedBalance = wallet.getBalance() + lockedPurchase.getChipsAwarded();
        wallet.setBalance(updatedBalance);

        ChipTransaction chipTransaction = new ChipTransaction();
        chipTransaction.setUser(user);
        chipTransaction.setPurchase(lockedPurchase);
        chipTransaction.setType(TransactionType.CHIP_PURCHASE);
        chipTransaction.setAmount(lockedPurchase.getChipsAwarded());
        chipTransaction.setBalanceAfter(updatedBalance);
        chipTransaction.setReferenceKey(referenceKey);

        paymentAttemptRepository.save(attempt);
        purchaseRepository.save(lockedPurchase);
        chipWalletRepository.save(wallet);
        ChipTransaction savedTx = chipTransactionRepository.save(chipTransaction);

        runAfterCommit(() ->
                sendPurchaseReceiptEmail(user, lockedPurchase, attempt, savedTx, updatedBalance)
        );
    }

    private void runAfterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()
                && TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    action.run();
                }
            });
        } else {
            action.run();
        }
    }

    private void sendPurchaseReceiptEmail(
            User user,
            Purchase purchase,
            PaymentAttempt attempt,
            ChipTransaction tx,
            long updatedBalance
    ) {
        String recipientEmail = user.getEmail();
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("Skipping purchase receipt email: user {} has no email", user.getId());
            return;
        }

        NumberFormat indianFormat = NumberFormat.getIntegerInstance(new Locale("en", "IN"));
        String formattedAmount = formatPaiseToRupees(purchase.getAmountInPaise());
        String displayName = (user.getName() != null && !user.getName().isBlank()) ? user.getName() : "User";

        String refId = attempt.getRazorpayPaymentId() != null && !attempt.getRazorpayPaymentId().isBlank()
                ? attempt.getRazorpayPaymentId()
                : (tx.getId() != null ? tx.getId().toString() : purchase.getId().toString());

        Map<String, Object> variables = new LinkedHashMap<>();
        variables.put("name", displayName != null ? displayName : "Player");
        variables.put("planName", purchase.getPlanName());
        variables.put("chipsPurchased", indianFormat.format(purchase.getChipsAwarded()));
        variables.put("currency", "₹");
        variables.put("amountPaid", formattedAmount);
        variables.put("newBalance", indianFormat.format(updatedBalance));
        variables.put("transactionId", refId);

        notificationService.sendNotification(NotificationRequest.builder()
                .recipient(recipientEmail)
                .template(NotificationTemplate.PURCHASE_RECEIPT)
                .variables(variables)
                .build()
        );
    }

    private String formatPaiseToRupees(Long amountInPaise) {
        if (amountInPaise == null) return "0";
        long rupees = amountInPaise / 100;
        long paise = Math.abs(amountInPaise % 100);
        NumberFormat indianFormat = NumberFormat.getIntegerInstance(new Locale("en", "IN"));
        if (paise == 0) {
            return indianFormat.format(rupees);
        }
        return indianFormat.format(rupees) + String.format(".%02d", paise);
    }
}
