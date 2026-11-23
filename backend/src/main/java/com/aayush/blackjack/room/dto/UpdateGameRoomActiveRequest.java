package com.aayush.blackjack.room.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateGameRoomActiveRequest(
        @NotNull(message = "active flag is required")
        Boolean active
) {}
