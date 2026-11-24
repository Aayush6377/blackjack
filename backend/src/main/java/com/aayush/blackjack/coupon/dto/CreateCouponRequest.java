package com.aayush.blackjack.coupon.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record CreateCouponRequest(
        @NotBlank(message = "Coupon code is required")
        @Size(max = 60, message = "Coupon code must be at most 60 characters")
        String code,

        @Size(max = 255, message = "Description must be at most 255 characters")
        String description,

        @NotNull(message = "Chip reward is required")
        @Min(value = 1, message = "Chip reward must be at least 1 chip")
        Long chipReward,

        @Min(value = 1, message = "Max uses per user must be at least 1")
        Integer maxUsesPerUser,

        @Min(value = 1, message = "Max total uses must be at least 1")
        Integer maxTotalUses,

        Boolean active,

        Instant startsAt,

        Instant expiresAt
) {}