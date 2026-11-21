package com.aayush.blackjack.game.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record InsuranceCommand(
        @NotNull UUID roundId,
        boolean accept,
        @NotBlank String idempotencyKey
) { }
