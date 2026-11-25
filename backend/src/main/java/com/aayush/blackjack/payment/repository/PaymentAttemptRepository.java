package com.aayush.blackjack.payment.repository;

import com.aayush.blackjack.payment.entity.PaymentAttempt;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, UUID> {

    Optional<PaymentAttempt> findByRazorpayOrderId(String razorpayOrderId);

    @Modifying
    @Transactional
    @Query("DELETE FROM PaymentAttempt pt WHERE pt.purchase.user.id = :userId")
    void deleteAllByUserId(@Param("userId") UUID userId);
}
