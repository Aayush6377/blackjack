package com.aayush.blackjack.game.dto;

import com.aayush.blackjack.game.engine.rules.PlayerActionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record GameActionCommand(
        @NotNull UUID roundId,
        UUID handId,
        @NotNull PlayerActionType action,
        @NotBlank String idempotencyKey
) { }
