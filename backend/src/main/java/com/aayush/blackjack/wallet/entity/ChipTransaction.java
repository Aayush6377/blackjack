package com.aayush.blackjack.wallet.entity;

import com.aayush.blackjack.game.entity.GameRound;
import com.aayush.blackjack.payment.entity.Purchase;
import com.aayush.blackjack.reward.entity.DailyRewardClaim;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.wallet.enums.TransactionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chip_transactions", indexes = {
        @Index(name = "idx_chip_txn_user", columnList = "user_id"),
        @Index(name = "idx_chip_txn_ref", columnList = "reference_key", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
public class ChipTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_round_id")
    private GameRound gameRound;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_id", unique = true)
    private Purchase purchase;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_reward_claim_id", unique = true)
    private DailyRewardClaim dailyRewardClaim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private Long balanceAfter;

    @Column(nullable = false, unique = true)
    private String referenceKey;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
