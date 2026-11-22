package com.aayush.blackjack.reward.dto;

import jakarta.validation.constraints.Min;
import java.util.List;

public record BulkDeleteRewardConfigRequest(
        @Min(value = 1, message = "startDay must be at least 1")
        Integer startDay,

        @Min(value = 1, message = "endDay must be at least 1")
        Integer endDay,

        List<@Min(value = 1, message = "Each day number must be at least 1") Integer> dayNumbers
) {
    public boolean hasExplicitDays() {
        return dayNumbers != null && !dayNumbers.isEmpty();
    }

    public boolean hasRange() {
        return startDay != null || endDay != null;
    }
}