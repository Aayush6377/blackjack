package com.aayush.blackjack.reward.dto;

import com.aayush.blackjack.reward.entity.DailyRewardClaim;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record DailyRewardClaimResponse(
        UUID claimId,
        UUID rewardConfigId,
        Integer dayNumber,
        LocalDate rewardDate,
        Long chipsCredited,
        Long walletBalanceAfter,
        Instant claimedAt
) {
    public static DailyRewardClaimResponse from(DailyRewardClaim claim, long balanceAfter) {
        return new DailyRewardClaimResponse(
                claim.getId(),
                claim.getRewardConfig().getId(),
                claim.getRewardConfig().getDayNumber(),
                claim.getRewardDate(),
                claim.getChipsCredited(),
                balanceAfter,
                claim.getClaimedAt()
        );
    }
}
