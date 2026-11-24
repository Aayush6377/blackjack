package com.aayush.blackjack.payment.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreatePaymentOrderRequest(
        @NotNull(message = "Plan ID is required")
        UUID planId
) {}