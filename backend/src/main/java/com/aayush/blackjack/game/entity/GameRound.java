package com.aayush.blackjack.game.entity;

import com.aayush.blackjack.game.engine.card.Card;
import com.aayush.blackjack.game.engine.settlement.HandOutcome;
import com.aayush.blackjack.game.enums.InsuranceStatus;
import com.aayush.blackjack.game.enums.RoundStatus;
import com.aayush.blackjack.room.entity.GameRoom;
import com.aayush.blackjack.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "game_rounds", indexes = {
        @Index(name = "idx_game_rounds_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
public class GameRound {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private GameRoom room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_shoe_id", nullable = false)
    private GameShoe gameShoe;

    @Column(nullable = false)
    private Long originalBet;

    @Column(nullable = false)
    private Long totalBet;

    @Column(nullable = false)
    private Long totalPayout = 0L;

    @Column(nullable = false)
    private Long netResult = 0L;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RoundStatus status = RoundStatus.IN_PROGRESS;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private HandOutcome outcome;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private List<Card> dealerCards = new ArrayList<>();

    @Column(nullable = false)
    private Integer dealerTotal = 0;

    @Column(nullable = false)
    private Long insuranceBet = 0L;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private InsuranceStatus insuranceStatus = InsuranceStatus.NONE;

    @Column(nullable = false)
    private Long insurancePayout = 0L;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> rulesSnapshot = new HashMap<>();

    @Version
    @Column(nullable = false)
    private Integer stateVersion = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant startedAt;

    private Instant completedAt;
}
