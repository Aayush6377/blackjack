package com.aayush.blackjack.room.dto;

import com.aayush.blackjack.room.entity.GameRoom;
import lombok.Builder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Builder
public record AdminGameRoomResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String difficulty,
        String backgroundUrl,
        String backgroundPublicId,
        String thumbnailUrl,
        String thumbnailPublicId,
        Boolean active,
        Integer displayOrder,
        RoomRulesDto rules,
        List<AdminRoomUnlockRuleDto> unlockRules,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminGameRoomResponse from(GameRoom room, List<AdminRoomUnlockRuleDto> unlockRules) {
        RoomRulesDto rulesDto = RoomRulesDto.builder()
                .minWallet(room.getMinWallet())
                .minBet(room.getMinBet())
                .maxBet(room.getMaxBet())
                .decksPerShoe(room.getDecksPerShoe())
                .reshuffleThreshold(room.getReshuffleThreshold())
                .blackjackPayout(room.getBlackjackPayout())
                .dealerHitsSoft17(room.getDealerHitsSoft17())
                .build();

        return AdminGameRoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .slug(room.getSlug())
                .description(room.getDescription())
                .difficulty(room.getDifficulty())
                .backgroundUrl(room.getBackgroundUrl())
                .backgroundPublicId(room.getBackgroundPublicId())
                .thumbnailUrl(room.getThumbnailUrl())
                .thumbnailPublicId(room.getThumbnailPublicId())
                .active(room.getActive())
                .displayOrder(room.getDisplayOrder())
                .rules(rulesDto)
                .unlockRules(unlockRules)
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }
}