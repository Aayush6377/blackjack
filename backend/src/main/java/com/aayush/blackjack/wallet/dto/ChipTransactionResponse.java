package com.aayush.blackjack.wallet.dto;

import com.aayush.blackjack.wallet.entity.ChipTransaction;
import com.aayush.blackjack.wallet.enums.TransactionType;

import java.time.Instant;
import java.util.UUID;

public record ChipTransactionResponse(
        UUID id,
        UUID roundId,
        TransactionType type,
        long amount,
        long balanceAfter,
        Instant createdAt
) {
    public static ChipTransactionResponse from(ChipTransaction txn) {
        return new ChipTransactionResponse(
                txn.getId(),
                txn.getGameRound() != null ? txn.getGameRound().getId() : null,
                txn.getType(),
                txn.getAmount(),
                txn.getBalanceAfter(),
                txn.getCreatedAt()
        );
    }
}
