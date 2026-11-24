package com.aayush.blackjack.coupon.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Optional;

public record UpdateCouponRequest(
        @Size(max = 60, message = "Coupon code must be at most 60 characters")
        String code,

        Optional<@Size(max = 255, message = "Description must be at most 255 characters") String> description,

        @Min(value = 1, message = "Chip reward must be at least 1 chip")
        Long chipReward,

        @Min(value = 1, message = "Max uses per user must be at least 1")
        Integer maxUsesPerUser,

        Optional<@Min(value = 1, message = "Max total uses must be at least 1") Integer> maxTotalUses,

        Boolean active,

        Optional<Instant> startsAt,

        Optional<Instant> expiresAt
) {}