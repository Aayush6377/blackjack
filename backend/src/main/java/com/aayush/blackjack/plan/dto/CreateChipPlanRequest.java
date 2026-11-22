package com.aayush.blackjack.plan.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record CreateChipPlanRequest(
        @NotBlank(message = "Plan name is required")
        @Size(max = 120, message = "Plan name must be at most 120 characters")
        String name,

        @Size(max = 2000, message = "Description must be at most 2000 characters")
        String description,

        @NotNull(message = "Chips amount is required")
        @Min(value = 1, message = "Chips must be at least 1")
        Long chips,

        @Min(value = 0, message = "Bonus chips cannot be negative")
        Long bonusChips,

        @NotNull(message = "Price in paise is required")
        @Min(value = 0, message = "Price cannot be negative")
        Long priceInPaise,

        Boolean active,

        @Min(value = 0, message = "Sale price cannot be negative")
        Long salePriceInPaise,

        @Size(max = 120, message = "Sale name must be at most 120 characters")
        String saleName,

        Instant saleStartAt,
        Instant saleEndAt
) {}