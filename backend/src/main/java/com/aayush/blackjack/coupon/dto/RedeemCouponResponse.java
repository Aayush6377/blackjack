package com.aayush.blackjack.coupon.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record RedeemCouponResponse(
        UUID redemptionId,
        String code,
        Long chipsAwarded,
        Long updatedWalletBalance,
        Instant redeemedAt
) {}