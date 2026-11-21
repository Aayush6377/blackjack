package com.aayush.blackjack.reward.dto;

import jakarta.validation.constraints.Min;

public record UpdateRewardConfigRequest(
        @Min(value = 1, message = "dayNumber must be at least 1")
        Integer dayNumber,

        @Min(value = 1, message = "chipsReward must be at least 1")
        Long chipsReward,

        Boolean active
) {}
