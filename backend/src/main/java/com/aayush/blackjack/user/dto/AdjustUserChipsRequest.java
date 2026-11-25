package com.aayush.blackjack.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AdjustUserChipsRequest(
        @NotNull(message = "chips amount is required")
        @Positive(message = "chips must be greater than 0")
        Long chips,

        @NotBlank(message = "reason is required")
        @Size(min = 3, max = 500, message = "reason must be between 3 and 500 characters")
        String reason
) { }