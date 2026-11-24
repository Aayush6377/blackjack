package com.aayush.blackjack.payment.dto;

import com.aayush.blackjack.payment.entity.Purchase;
import com.aayush.blackjack.payment.enums.PurchaseStatus;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record PurchaseHistoryResponse(
        UUID id,
        UUID planId,
        String planName,
        Long chipsAwarded,
        Long amountInPaise,
        PurchaseStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static PurchaseHistoryResponse from(Purchase purchase) {
        return PurchaseHistoryResponse.builder()
                .id(purchase.getId())
                .planId(purchase.getPlan() != null ? purchase.getPlan().getId() : null)
                .planName(purchase.getPlanName())
                .chipsAwarded(purchase.getChipsAwarded())
                .amountInPaise(purchase.getAmountInPaise())
                .status(purchase.getStatus())
                .createdAt(purchase.getCreatedAt())
                .updatedAt(purchase.getUpdatedAt())
                .build();
    }
}