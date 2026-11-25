package com.aayush.blackjack.user.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record AdjustUserChipsResponse(
        UUID userId,
        UUID transactionId,
        long chipsAdded,
        long newBalance,
        String reason,
        Instant adjustedAt
) { }