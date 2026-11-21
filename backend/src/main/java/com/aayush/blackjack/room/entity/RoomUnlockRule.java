package com.aayush.blackjack.room.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "room_unlock_rules", uniqueConstraints = {
        @UniqueConstraint(name = "uk_room_prereq", columnNames = {"room_id", "prerequisite_room_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class RoomUnlockRule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private GameRoom room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prerequisite_room_id", nullable = false)
    private GameRoom prerequisiteRoom;

    @Column(nullable = false)
    private Integer requiredRounds = 0;

    @Column(nullable = false)
    private Integer requiredWins = 0;

    @Column(nullable = false)
    private Long minimumWallet = 0L;
}
