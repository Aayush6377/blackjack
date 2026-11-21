package com.aayush.blackjack.game.entity;

import com.aayush.blackjack.game.enums.GameActionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "game_actions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_round_sequence", columnNames = {"game_round_id", "sequence_number"})
}, indexes = {
        @Index(name = "idx_game_actions_round", columnList = "game_round_id")
})
@Getter
@Setter
@NoArgsConstructor
public class GameAction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_round_id", nullable = false)
    private GameRound gameRound;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_hand_id")
    private GameHand gameHand;

    @Column(nullable = false)
    private Integer sequenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private GameActionType actionType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> actionData = new HashMap<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
