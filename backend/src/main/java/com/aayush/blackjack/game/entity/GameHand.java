package com.aayush.blackjack.game.entity;

import com.aayush.blackjack.game.engine.card.Card;
import com.aayush.blackjack.game.engine.settlement.HandOutcome;
import com.aayush.blackjack.game.enums.HandStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "game_hands", indexes = {
        @Index(name = "idx_game_hands_round", columnList = "game_round_id")
})
@Getter
@Setter
@NoArgsConstructor
public class GameHand {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_round_id", nullable = false)
    private GameRound gameRound;

    @Column(nullable = false)
    private Integer handNumber = 1;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private List<Card> cards = new ArrayList<>();

    @Column(nullable = false)
    private Long betAmount;

    @Column(nullable = false)
    private Integer handValue = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private HandStatus status = HandStatus.ACTIVE;

    @Column(nullable = false)
    private Boolean fromSplit = false;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private HandOutcome outcome;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
