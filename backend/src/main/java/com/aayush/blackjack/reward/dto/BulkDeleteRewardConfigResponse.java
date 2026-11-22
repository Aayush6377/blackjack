package com.aayush.blackjack.reward.dto;

import java.util.List;

public record BulkDeleteRewardConfigResponse(
        int deletedCount,
        List<Integer> deletedDayNumbers,
        List<RewardConfigResponse> remainingConfigs
) {}