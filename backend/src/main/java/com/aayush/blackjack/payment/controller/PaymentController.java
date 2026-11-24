package com.aayush.blackjack.payment.controller;

import com.aayush.blackjack.common.dto.PageResponse;
import com.aayush.blackjack.payment.dto.*;
import com.aayush.blackjack.payment.service.PaymentCheckoutService;
import com.aayush.blackjack.payment.service.PurchaseHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentCheckoutService paymentCheckoutService;
    private final PurchaseHistoryService purchaseHistoryService;

    @GetMapping("/purchases")
    public ResponseEntity<PageResponse<PurchaseHistoryResponse>> getMyPurchases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(purchaseHistoryService.getMyPurchases(page, limit));
    }

    @PostMapping("/orders")
    public ResponseEntity<CreatePaymentOrderResponse> createOrder(@Valid @RequestBody CreatePaymentOrderRequest request) {
        return ResponseEntity.ok(paymentCheckoutService.initiatePurchase(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        return ResponseEntity.ok(paymentCheckoutService.verifyCurrentUserPayment(request));
    }

    @PostMapping("/webhooks/razorpay")
    public ResponseEntity<Void> handleRazorpayWebhook(
            @RequestBody String rawPayload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature,
            @RequestHeader(value = "X-Razorpay-Event-Id", required = false) String eventId
    ) {
        paymentCheckoutService.processWebhook(rawPayload, signature, eventId);
        return ResponseEntity.ok().build();
    }
}