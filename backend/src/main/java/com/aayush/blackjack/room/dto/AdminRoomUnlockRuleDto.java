package com.aayush.blackjack.room.dto;

import com.aayush.blackjack.room.entity.RoomUnlockRule;
import lombok.Builder;

import java.util.UUID;

@Builder
public record AdminRoomUnlockRuleDto(
        UUID id,
        UUID prerequisiteRoomId,
        String prerequisiteRoomName,
        String prerequisiteRoomSlug,
        Integer requiredRounds,
        Integer requiredWins,
        Long minimumWallet
) {
    public static AdminRoomUnlockRuleDto from(RoomUnlockRule rule) {
        return AdminRoomUnlockRuleDto.builder()
                .id(rule.getId())
                .prerequisiteRoomId(rule.getPrerequisiteRoom().getId())
                .prerequisiteRoomName(rule.getPrerequisiteRoom().getName())
                .prerequisiteRoomSlug(rule.getPrerequisiteRoom().getSlug())
                .requiredRounds(rule.getRequiredRounds())
                .requiredWins(rule.getRequiredWins())
                .minimumWallet(rule.getMinimumWallet())
                .build();
    }
}