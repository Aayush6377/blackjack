package com.aayush.blackjack.room.dto;

import jakarta.validation.constraints.Min;

import java.util.UUID;

public record UpdateRoomUnlockRuleRequest(
        UUID prerequisiteRoomId,

        @Min(value = 0, message = "requiredRounds must be 0 or greater")
        Integer requiredRounds,

        @Min(value = 0, message = "requiredWins must be 0 or greater")
        Integer requiredWins,

        @Min(value = 0, message = "minimumWallet must be 0 or greater")
        Long minimumWallet
) {}