package com.aayush.blackjack.game.entity;

import com.aayush.blackjack.game.engine.card.Card;
import com.aayush.blackjack.game.enums.ShoeStatus;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "game_shoes", indexes = {
        @Index(name = "idx_game_shoes_user_room", columnList = "user_id, room_id")
})
@Getter
@Setter
@NoArgsConstructor
public class GameShoe {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private GameRoom room;

    @Column(nullable = false)
    private Integer decksCount;

    @Column(nullable = false)
    private Integer totalCards;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private List<Card> shuffledCards = new ArrayList<>();

    @Column(nullable = false)
    private Integer nextCardIndex = 0;

    @Column(nullable = false)
    private Double reshuffleThreshold = 0.75d;

    @Column(nullable = false)
    private Integer shuffleNumber = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ShoeStatus status = ShoeStatus.ACTIVE;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
