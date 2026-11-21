package com.aayush.blackjack.game.websocket.dto;

import com.aayush.blackjack.game.websocket.enums.ConnectionStatus;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record SessionBinding(
        String sessionId,
        UUID userId,
        UUID activeRoundId,
        ConnectionStatus status,
        Instant disconnectedAt,
        Instant graceDeadline
) { }
