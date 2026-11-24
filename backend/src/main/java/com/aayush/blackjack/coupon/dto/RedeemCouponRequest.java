package com.aayush.blackjack.coupon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedeemCouponRequest(
        @NotBlank(message = "Coupon code is required")
        @Size(max = 60, message = "Coupon code must be at most 60 characters")
        String code
) {}