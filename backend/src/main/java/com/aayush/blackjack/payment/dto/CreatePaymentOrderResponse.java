package com.aayush.blackjack.payment.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record CreatePaymentOrderResponse(
        UUID purchaseId,
        String razorpayOrderId,
        Long amountInPaise,
        String currency,
        String keyId,
        String planName,
        Long chipsAwarded
) {}
