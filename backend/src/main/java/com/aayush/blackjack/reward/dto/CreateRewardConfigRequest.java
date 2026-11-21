package com.aayush.blackjack.reward.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateRewardConfigRequest(
        @Min(value = 1, message = "dayNumber must be at least 1")
        Integer dayNumber,

        @NotNull(message = "chipsReward is required")
        @Min(value = 1, message = "chipsReward must be at least 1")
        Long chipsReward,

        Boolean active
) {}
