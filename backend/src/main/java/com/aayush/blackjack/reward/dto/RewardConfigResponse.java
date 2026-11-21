package com.aayush.blackjack.reward.dto;

import com.aayush.blackjack.reward.entity.RewardConfig;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record RewardConfigResponse(
        UUID id,
        Integer dayNumber,
        Long chipsReward,
        Boolean active,
        Instant createdAt
) {

    public static RewardConfigResponse from(RewardConfig config) {
        return RewardConfigResponse.builder()
                .id(config.getId())
                .dayNumber(config.getDayNumber())
                .chipsReward(config.getChipsReward())
                .active(config.getActive())
                .createdAt(config.getCreatedAt())
                .build();
    }
}
