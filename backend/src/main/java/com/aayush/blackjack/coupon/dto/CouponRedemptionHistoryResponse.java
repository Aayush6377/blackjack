package com.aayush.blackjack.coupon.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record CouponRedemptionHistoryResponse(
        UUID id,
        String code,
        Long chipsAwarded,
        Instant redeemedAt
) {}