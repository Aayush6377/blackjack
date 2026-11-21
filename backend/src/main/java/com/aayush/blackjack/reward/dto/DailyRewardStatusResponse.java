package com.aayush.blackjack.reward.dto;

import java.time.LocalDate;
import java.util.List;

public record DailyRewardStatusResponse(
        LocalDate today,
        boolean claimedToday,
        int currentStreakDay,
        int nextRewardDay,
        Long nextChipsReward,
        int totalConfiguredDays,
        Long walletBalance,
        List<RewardConfigResponse> schedule,
        List<DailyRewardClaimResponse> recentClaims
) {}
