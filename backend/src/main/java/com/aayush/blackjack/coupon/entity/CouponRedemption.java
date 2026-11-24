package com.aayush.blackjack.coupon.entity;

import com.aayush.blackjack.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "coupon_redemptions",
        indexes = {
                @Index(name = "idx_coupon_redemptions_coupon_user", columnList = "coupon_id, user_id"),
                @Index(name = "idx_coupon_redemptions_user", columnList = "user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class CouponRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String couponCodeSnapshot;

    @Column(nullable = false)
    private Long chipsAwarded;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant redeemedAt;
}