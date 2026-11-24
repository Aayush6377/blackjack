package com.aayush.blackjack.payment.repository;

import com.aayush.blackjack.payment.entity.PaymentAttempt;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, UUID> {

    Optional<PaymentAttempt> findByRazorpayOrderId(String razorpayOrderId);
}
