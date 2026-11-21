package com.aayush.blackjack.wallet.dto;

import com.aayush.blackjack.wallet.entity.ChipWallet;

import java.time.Instant;
import java.util.UUID;

public record WalletSummaryResponse(
        UUID walletId,
        long balance,
        Instant updatedAt
) {
    public static WalletSummaryResponse from(ChipWallet wallet) {
        return new WalletSummaryResponse(
                wallet.getId(),
                wallet.getBalance(),
                wallet.getUpdatedAt()
        );
    }
}
