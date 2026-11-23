package com.aayush.blackjack.room.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateRoomUnlockRuleRequest(
        @NotNull(message = "prerequisiteRoomId is required")
        UUID prerequisiteRoomId,

        @NotNull(message = "requiredRounds is required")
        @Min(value = 0, message = "requiredRounds must be 0 or greater")
        Integer requiredRounds,

        @NotNull(message = "requiredWins is required")
        @Min(value = 0, message = "requiredWins must be 0 or greater")
        Integer requiredWins,

        @NotNull(message = "minimumWallet is required")
        @Min(value = 0, message = "minimumWallet must be 0 or greater")
        Long minimumWallet
) {}