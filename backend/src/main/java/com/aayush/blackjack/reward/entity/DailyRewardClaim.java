package com.aayush.blackjack.reward.entity;

import com.aayush.blackjack.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_reward_claims", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_reward_date", columnNames = {"user_id", "reward_date"})
}, indexes = {
        @Index(name = "idx_daily_claim_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
public class DailyRewardClaim {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reward_config_id", nullable = false)
    private RewardConfig rewardConfig;

    @Column(nullable = false)
    private LocalDate rewardDate;

    @Column(nullable = false)
    private Long chipsCredited;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant claimedAt;
}
