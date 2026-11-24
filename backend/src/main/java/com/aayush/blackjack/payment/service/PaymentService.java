package com.aayush.blackjack.payment.service;

import com.aayush.blackjack.payment.dto.CreatePaymentOrderRequest;
import com.aayush.blackjack.payment.dto.CreatePaymentOrderResponse;
import com.aayush.blackjack.payment.dto.PaymentVerificationResponse;
import com.aayush.blackjack.payment.dto.VerifyPaymentRequest;

import java.util.UUID;

public interface PaymentService {
    CreatePaymentOrderResponse pay(UUID userId, CreatePaymentOrderRequest request);

    PaymentVerificationResponse verifyPayment(UUID userId, VerifyPaymentRequest request);

    void handleWebhook(String rawPayload, String signatureHeader, String eventId);
}
