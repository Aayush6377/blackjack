package com.aayush.blackjack.user.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(
        @NotNull(message = "enabled flag is required")
        Boolean enabled
) { }