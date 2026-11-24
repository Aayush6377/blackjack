package com.aayush.blackjack.coupon.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "coupons",
        indexes = {
                @Index(name = "idx_coupons_code", columnList = "code", unique = true),
                @Index(name = "idx_coupons_active_window", columnList = "active, starts_at, expires_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 60)
    private String code;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private Long chipReward;

    @Column(nullable = false)
    private Integer maxUsesPerUser = 1;

    private Integer maxTotalUses;

    @Column(nullable = false)
    private Long timesRedeemed = 0L;

    @Column(nullable = false)
    private Boolean active = true;

    private Instant startsAt;

    private Instant expiresAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}