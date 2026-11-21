package com.aayush.blackjack.room.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record UnlockRequirementDto(
        UUID prerequisiteRoomId,
        String prerequisiteRoomName,
        String prerequisiteRoomSlug,
        Integer requiredRounds,
        Integer requiredWins,
        Long minimumWallet,
        boolean met
) {}
