package com.aayush.blackjack.payment.service;

import com.aayush.blackjack.payment.dto.CreatePaymentOrderRequest;
import com.aayush.blackjack.payment.dto.CreatePaymentOrderResponse;
import com.aayush.blackjack.payment.dto.PaymentVerificationResponse;
import com.aayush.blackjack.payment.dto.VerifyPaymentRequest;
import com.aayush.blackjack.security.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentCheckoutService {

    private final CurrentUserService currentUserService;
    private final PaymentService paymentService;

    public CreatePaymentOrderResponse initiatePurchase(CreatePaymentOrderRequest request) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        return paymentService.pay(currentUserId, request);
    }

    public PaymentVerificationResponse verifyCurrentUserPayment(VerifyPaymentRequest request) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        return paymentService.verifyPayment(currentUserId, request);
    }

    public void processWebhook(String rawPayload, String signatureHeader, String eventId) {
        paymentService.handleWebhook(rawPayload, signatureHeader, eventId);
    }
}
