package com.aayush.blackjack.room.dto;

import lombok.Builder;

import java.time.Instant;

@Builder
public record RoomProgressDto(
        Integer roundsPlayed,
        Integer roundsWon,
        Boolean unlocked,
        Instant unlockedAt
) {}
