package com.aayush.blackjack.room.dto;

import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record RoomSummaryResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String difficulty,
        String backgroundUrl,
        String thumbnailUrl,
        Integer displayOrder,
        boolean unlocked,
        boolean eligibleToPlay,
        RoomRulesDto rules,
        RoomProgressDto progress,
        List<UnlockRequirementDto> unlockRequirements
) { }