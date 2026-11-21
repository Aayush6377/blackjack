package com.aayush.blackjack.payment.entity;

import com.aayush.blackjack.payment.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_attempts", indexes = {
        @Index(name = "idx_payment_order_id", columnList = "razorpay_order_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
public class PaymentAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_id", nullable = false)
    private Purchase purchase;

    @Column(nullable = false, unique = true)
    private String razorpayOrderId;

    private String razorpayPaymentId;
    private String razorpaySignature;

    @Column(nullable = false)
    private Long amountInPaise;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentStatus status = PaymentStatus.PENDING;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
