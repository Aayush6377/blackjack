package com.aayush.blackjack.room.entity;

import com.aayush.blackjack.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "room_progress", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_room", columnNames = {"user_id", "room_id"})
}, indexes = {
        @Index(name = "idx_room_progress_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
public class RoomProgress {
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
    private Integer roundsPlayed = 0;

    @Column(nullable = false)
    private Integer roundsWon = 0;

    @Column(nullable = false)
    private Boolean unlocked = false;

    private Instant unlockedAt;
}
