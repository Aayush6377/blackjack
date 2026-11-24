package com.aayush.blackjack.payment.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record PaymentVerificationResponse(
        UUID purchaseId,
        String status,
        Long chipsAwarded
) {}
