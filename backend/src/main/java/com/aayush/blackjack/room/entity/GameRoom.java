package com.aayush.blackjack.room.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "game_rooms", indexes = {
        @Index(name = "idx_game_rooms_slug", columnList = "slug", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
public class GameRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String difficulty = "BEGINNER";

    @Column(columnDefinition = "TEXT")
    private String backgroundUrl;

    private String backgroundPublicId;

    @Column(columnDefinition = "TEXT")
    private String thumbnailUrl;

    private String thumbnailPublicId;

    @Column(nullable = false)
    private Long minWallet = 100L;

    @Column(nullable = false)
    private Long minBet = 10L;

    @Column(nullable = false)
    private Long maxBet = 1000L;

    @Column(nullable = false)
    private Integer decksPerShoe = 1;

    @Column(nullable = false)
    private Double reshuffleThreshold = 0.75d;

    @Column(nullable = false, length = 20)
    private String blackjackPayout = "3:2";

    @Column(name = "dealer_hits_soft_17", nullable = false)
    private Boolean dealerHitsSoft17 = true;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
