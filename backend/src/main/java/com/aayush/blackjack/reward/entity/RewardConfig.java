package com.aayush.blackjack.reward.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reward_configs", indexes = {
        @Index(name = "idx_reward_configs_day", columnList = "day_number", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
public class RewardConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private Integer dayNumber;

    @Column(nullable = false)
    private Long chipsReward;

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
