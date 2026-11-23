package com.aayush.blackjack.room.dto;

import java.util.UUID;

public record GameRoomDeletedEvent(
        UUID roomId,
        String backgroundPublicId,
        String thumbnailPublicId
) {}