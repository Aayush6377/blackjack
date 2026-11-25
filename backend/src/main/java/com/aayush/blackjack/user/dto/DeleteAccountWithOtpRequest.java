package com.aayush.blackjack.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DeleteAccountWithOtpRequest(
        @NotBlank(message = "OTP code is required")
        @Size(min = 6, max = 6, message = "OTP code must be 6 characters")
        String code
) { }