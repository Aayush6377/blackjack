package com.aayush.blackjack.plan.dto;

import com.aayush.blackjack.plan.entity.ChipPlan;

import java.time.Instant;
import java.util.UUID;

public record ChipPlanResponse(
        UUID id,
        String name,
        String description,
        Long chips,
        Long bonusChips,
        Long totalChips,
        Long priceInPaise,
        Long effectivePriceInPaise,
        boolean onSale,
        Boolean active,
        Long salePriceInPaise,
        String saleName,
        Instant saleStartAt,
        Instant saleEndAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static ChipPlanResponse from(ChipPlan plan) {
        long baseChips = plan.getChips() != null ? plan.getChips() : 0L;
        long bonus = plan.getBonusChips() != null ? plan.getBonusChips() : 0L;
        boolean saleActive = plan.isOnSale();

        return new ChipPlanResponse(
                plan.getId(),
                plan.getName(),
                plan.getDescription(),
                baseChips,
                bonus,
                baseChips + bonus,
                plan.getPriceInPaise(),
                plan.getEffectivePrice(),
                saleActive,
                plan.getActive(),
                plan.getSalePriceInPaise(),
                plan.getSaleName(),
                plan.getSaleStartAt(),
                plan.getSaleEndAt(),
                plan.getCreatedAt(),
                plan.getUpdatedAt()
        );
    }
}