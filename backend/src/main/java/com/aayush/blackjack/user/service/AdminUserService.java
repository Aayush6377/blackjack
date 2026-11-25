package com.aayush.blackjack.user.service;

import com.aayush.blackjack.admin.service.AdminAuditService;
import com.aayush.blackjack.common.dto.PageRequest;
import com.aayush.blackjack.common.dto.PageResponse;
import com.aayush.blackjack.notification.dto.NotificationRequest;
import com.aayush.blackjack.notification.enums.NotificationTemplate;
import com.aayush.blackjack.notification.service.NotificationService;
import com.aayush.blackjack.payment.dto.PurchaseHistoryResponse;
import com.aayush.blackjack.payment.entity.Purchase;
import com.aayush.blackjack.payment.repository.PurchaseRepository;
import com.aayush.blackjack.security.service.CurrentUserService;
import com.aayush.blackjack.user.dto.AdjustUserChipsRequest;
import com.aayush.blackjack.user.dto.AdjustUserChipsResponse;
import com.aayush.blackjack.user.dto.AdminUserDetailResponse;
import com.aayush.blackjack.user.dto.AdminUserSummaryResponse;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.enums.Role;
import com.aayush.blackjack.user.repository.UserRepository;
import com.aayush.blackjack.wallet.entity.ChipTransaction;
import com.aayush.blackjack.wallet.entity.ChipWallet;
import com.aayush.blackjack.wallet.enums.TransactionType;
import com.aayush.blackjack.wallet.repository.ChipTransactionRepository;
import com.aayush.blackjack.wallet.repository.ChipWalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private static final Set<String> ALLOWED_USER_SORT_FIELDS = Set.of(
            "createdAt", "updatedAt", "name", "email", "enabled"
    );

    private static final Set<String> ALLOWED_PURCHASE_SORT_FIELDS = Set.of(
            "createdAt", "amountInPaise", "chipsAwarded", "status"
    );

    private final UserRepository userRepository;
    private final ChipWalletRepository chipWalletRepository;
    private final ChipTransactionRepository chipTransactionRepository;
    private final PurchaseRepository purchaseRepository;
    private final AdminAuditService auditLogService;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public PageResponse<AdminUserSummaryResponse> getUsers(PageRequest<Void> request) {
        PageRequest<Void> safeRequest = request != null
                ? request
                : new PageRequest<>(0, 10, "createdAt", "DESC", "", null);

        Pageable pageable = safeRequest.toPageable(ALLOWED_USER_SORT_FIELDS, "createdAt");
        String search = safeRequest.normalizedSearch();

        Page<User> userPage = userRepository.searchUsersByRole(Role.USER, search, pageable);

        return PageResponse.from(userPage, user -> {
            long balance = chipWalletRepository.findByUser_Id(user.getId())
                    .map(ChipWallet::getBalance)
                    .orElse(0L);
            return AdminUserSummaryResponse.from(user, balance);
        });
    }

    @Transactional(readOnly = true)
    public AdminUserDetailResponse getUserDetails(UUID userId) {
        User user = findManagedUser(userId);
        ChipWallet wallet = chipWalletRepository.findByUser_Id(userId).orElse(null);

        long balance = wallet != null ? wallet.getBalance() : 0L;
        UUID walletId = wallet != null ? wallet.getId() : null;
        long totalPurchases = purchaseRepository.countByUser_Id(userId);
        long totalPaidInPaise = purchaseRepository.sumSuccessfulAmountInPaiseByUserId(userId);

        return AdminUserDetailResponse.from(
                user,
                walletId,
                balance,
                totalPurchases,
                totalPaidInPaise
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<PurchaseHistoryResponse> getUserPurchases(UUID userId, PageRequest<Void> request) {
        findManagedUser(userId);

        PageRequest<Void> safeRequest = request != null
                ? request
                : new PageRequest<>(0, 10, "createdAt", "DESC", "", null);

        Pageable pageable = safeRequest.toPageable(ALLOWED_PURCHASE_SORT_FIELDS, "createdAt");
        Page<Purchase> purchasesPage = purchaseRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);

        return PageResponse.from(purchasesPage, PurchaseHistoryResponse::from);
    }

    @Transactional
    public AdminUserSummaryResponse updateUserEnabledStatus(UUID userId, boolean enabled) {
        User user = findManagedUser(userId);
        boolean previousStatus = Boolean.TRUE.equals(user.getEnabled());

        user.setEnabled(enabled);
        User savedUser = userRepository.save(user);

        long balance = chipWalletRepository.findByUser_Id(userId)
                .map(ChipWallet::getBalance)
                .orElse(0L);

        auditLogService.log(
                "UPDATED_USER_STATUS",
                "USER",
                savedUser.getId(),
                Map.of("email", savedUser.getEmail(), "enabled", previousStatus),
                Map.of("email", savedUser.getEmail(), "enabled", enabled)
        );

        return AdminUserSummaryResponse.from(savedUser, balance);
    }

    @Transactional
    public AdjustUserChipsResponse adjustUserChips(UUID userId, AdjustUserChipsRequest request) {
        UUID adminId = currentUserService.getCurrentUserId();
        User user = findManagedUser(userId);
        long chipsToAdd = request.chips();
        String trimmedReason = request.reason().trim();

        ChipWallet wallet = chipWalletRepository.findLockedByUserId(userId)
                .orElseGet(() -> {
                    ChipWallet newWallet = new ChipWallet();
                    newWallet.setUser(user);
                    newWallet.setBalance(0L);
                    return chipWalletRepository.save(newWallet);
                });

        long oldBalance = wallet.getBalance();
        long updatedBalance = oldBalance + chipsToAdd;
        wallet.setBalance(updatedBalance);
        chipWalletRepository.save(wallet);

        ChipTransaction tx = new ChipTransaction();
        tx.setUser(user);
        tx.setType(TransactionType.ADMIN_ADJUSTMENT);
        tx.setAmount(chipsToAdd);
        tx.setBalanceAfter(updatedBalance);
        tx.setReferenceKey("txn:adjustment:" + adminId + ":" + user.getId() + ":" + UUID.randomUUID());
        ChipTransaction savedTx = chipTransactionRepository.save(tx);

        auditLogService.log(
                "USER_CHIPS_ADJUSTED",
                "USER",
                user.getId(),
                Map.of(
                        "email", user.getEmail(),
                        "balance", oldBalance
                ),
                Map.of(
                        "email", user.getEmail(),
                        "transactionId", savedTx.getId().toString(),
                        "chips", chipsToAdd,
                        "balance", updatedBalance,
                        "reason", trimmedReason
                )
        );

        Instant adjustedAt = savedTx.getCreatedAt() != null ? savedTx.getCreatedAt() : Instant.now();

        runAfterCommit(() -> notificationService.sendNotification(
                NotificationRequest.builder()
                        .recipient(user.getEmail())
                        .template(NotificationTemplate.ADMIN_CHIP_ADJUSTMENT)
                        .variables(Map.of(
                                "name", user.getName() != null ? user.getName() : "Player",
                                "chipsAdded", chipsToAdd,
                                "newBalance", updatedBalance,
                                "reason", trimmedReason,
                                "transactionId", savedTx.getId().toString()
                        ))
                        .build()
        ));

        return AdjustUserChipsResponse.builder()
                .userId(user.getId())
                .transactionId(savedTx.getId())
                .chipsAdded(chipsToAdd)
                .newBalance(updatedBalance)
                .reason(trimmedReason)
                .adjustedAt(adjustedAt)
                .build();
    }

    private User findManagedUser(UUID userId) {
        User user = userRepository.findByIdAndDeleted(userId, false)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() != Role.USER) {
            throw new IllegalArgumentException("Only standard USER accounts can be managed here");
        }

        return user;
    }

    private void runAfterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
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
}
