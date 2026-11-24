package com.aayush.blackjack.wallet.service;

import com.aayush.blackjack.common.dto.PageResponse;
import com.aayush.blackjack.game.entity.GameRound;
import com.aayush.blackjack.security.service.CurrentUserService;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.repository.UserRepository;
import com.aayush.blackjack.wallet.dto.ChipTransactionResponse;
import com.aayush.blackjack.wallet.entity.ChipTransaction;
import com.aayush.blackjack.wallet.entity.ChipWallet;
import com.aayush.blackjack.wallet.enums.TransactionType;
import com.aayush.blackjack.wallet.repository.ChipTransactionRepository;
import com.aayush.blackjack.wallet.repository.ChipWalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {

    private static final long INITIAL_BALANCE = 1000L;

    private final ChipWalletRepository chipWalletRepository;
    private final ChipTransactionRepository chipTransactionRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public long getBalance(UUID userId) {
        return chipWalletRepository.findByUser_Id(userId)
                .map(ChipWallet::getBalance)
                .orElse(0L);
    }

    @Transactional(readOnly = true)
    public PageResponse<ChipTransactionResponse> getTransactionHistory(int page, int limit) {
        UUID userId = currentUserService.getCurrentUserId();
        int safePage = Math.max(page, 0);
        int safeLimit = Math.min(Math.max(limit, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage,
                safeLimit,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<ChipTransaction> txPage = chipTransactionRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
        return PageResponse.from(txPage, ChipTransactionResponse::from);
    }

    @Transactional
    public ChipWallet getOrCreateWallet() {
        User user = currentUserService.getCurrentUser();

        return chipWalletRepository.findLockedByUserId(user.getId())
                .orElseGet(() -> {
                    ChipWallet wallet = new ChipWallet();
                    wallet.setUser(user);
                    wallet.setBalance(INITIAL_BALANCE);
                    return chipWalletRepository.save(wallet);
                });
    }

    @Transactional
    public ChipTransaction debitBet(UUID userId, long amount, GameRound round, String actionIdempotencyKey) {
        return debit(userId, amount, TransactionType.BET_PLACED, round,
                "txn:bet:" + round.getId() + ":" + actionIdempotencyKey);
    }

    @Transactional
    public ChipTransaction debitInsurance(UUID userId, long amount, GameRound round, String actionIdempotencyKey) {
        return debit(userId, amount, TransactionType.INSURANCE_PLACED, round,
                "txn:insurance:" + round.getId() + ":" + actionIdempotencyKey);
    }

    @Transactional
    public ChipTransaction debitAdditionalBet(UUID userId, long amount, GameRound round, String actionIdempotencyKey) {
        return debit(userId, amount, TransactionType.ADDITIONAL_BET, round,
                "txn:addbet:" + round.getId() + ":" + actionIdempotencyKey);
    }

    @Transactional
    public Optional<ChipTransaction> creditSettlement(
            UUID userId,
            long amount,
            TransactionType creditType,
            GameRound round,
            String referenceSuffix
    ) {
        if (amount <= 0) {
            return Optional.empty();
        }
        return Optional.of(credit(userId, amount, creditType, round,
                "txn:settle:" + round.getId() + ":" + referenceSuffix));
    }

    @Transactional
    public ChipTransaction debit(
            UUID userId,
            long amount,
            TransactionType type,
            GameRound round,
            String referenceKey
    ) {
        validateDebitType(type);
        validatePositiveAmount(amount);

        Optional<ChipTransaction> existing = chipTransactionRepository.findByReferenceKey(referenceKey);
        if (existing.isPresent()) {
            return existing.get();
        }

        ChipWallet wallet = lockWalletOrThrow(userId);
        long currentBalance = wallet.getBalance();
        if (currentBalance < amount) {
            throw new IllegalArgumentException("Insufficient chip balance. Required: " + amount + ", available: " + currentBalance);
        }

        long newBalance = Math.subtractExact(currentBalance, amount);
        wallet.setBalance(newBalance);
        chipWalletRepository.save(wallet);

        return saveTransaction(wallet.getUser(), round, type, amount, newBalance, referenceKey);
    }

    @Transactional
    public ChipTransaction credit(
            UUID userId,
            long amount,
            TransactionType type,
            GameRound round,
            String referenceKey
    ) {
        validateCreditType(type);
        validatePositiveAmount(amount);

        Optional<ChipTransaction> existing = chipTransactionRepository.findByReferenceKey(referenceKey);
        if (existing.isPresent()) {
            return existing.get();
        }

        ChipWallet wallet = lockWalletOrThrow(userId);
        long newBalance = Math.addExact(wallet.getBalance(), amount);
        wallet.setBalance(newBalance);
        chipWalletRepository.save(wallet);

        User user = wallet.getUser() != null ? wallet.getUser() : userRepository.getReferenceById(userId);
        return saveTransaction(user, round, type, amount, newBalance, referenceKey);
    }

    private ChipWallet lockWalletOrThrow(UUID userId) {
        return chipWalletRepository.findLockedByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Chip wallet not found for user: " + userId));
    }

    private ChipTransaction saveTransaction(
            User user,
            GameRound round,
            TransactionType type,
            long amount,
            long balanceAfter,
            String referenceKey
    ) {
        ChipTransaction txn = new ChipTransaction();
        txn.setUser(user);
        txn.setGameRound(round);
        txn.setType(type);
        txn.setAmount(amount);
        txn.setBalanceAfter(balanceAfter);
        txn.setReferenceKey(referenceKey);
        return chipTransactionRepository.save(txn);
    }

    private void validatePositiveAmount(long amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Transaction chip amount must be greater than zero");
        }
    }

    private void validateDebitType(TransactionType type) {
        if (type != TransactionType.BET_PLACED
                && type != TransactionType.INSURANCE_PLACED
                && type != TransactionType.ADDITIONAL_BET) {
            throw new IllegalArgumentException("Invalid debit transaction type: " + type);
        }
    }

    private void validateCreditType(TransactionType type) {
        if (type == TransactionType.BET_PLACED
                || type == TransactionType.INSURANCE_PLACED
                || type == TransactionType.ADDITIONAL_BET) {
            throw new IllegalArgumentException("Invalid credit transaction type: " + type);
        }
    }
}
