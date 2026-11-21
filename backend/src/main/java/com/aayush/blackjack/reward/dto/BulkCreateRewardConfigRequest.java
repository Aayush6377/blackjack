package com.aayush.blackjack.reward.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record BulkCreateRewardConfigRequest(
        @NotNull(message = "days is required")
        @Min(value = 1, message = "days must be at least 1")
        Integer days,

        @Min(value = 1, message = "startDay must be at least 1")
        Integer startDay,

        @NotNull(message = "baseChipsReward is required")
        @Min(value = 1, message = "baseChipsReward must be at least 1")
        Long baseChipsReward,

        @Min(value = 0, message = "incrementPerDay cannot be negative")
        Long incrementPerDay,

        Boolean active,

        List<Long> explicitRewards
) {}
