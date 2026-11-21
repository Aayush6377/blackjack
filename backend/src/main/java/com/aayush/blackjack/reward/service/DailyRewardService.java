package com.aayush.blackjack.reward.service;

import com.aayush.blackjack.reward.dto.DailyRewardClaimResponse;
import com.aayush.blackjack.reward.dto.DailyRewardStatusResponse;
import com.aayush.blackjack.reward.dto.RewardConfigResponse;
import com.aayush.blackjack.reward.entity.DailyRewardClaim;
import com.aayush.blackjack.reward.entity.RewardConfig;
import com.aayush.blackjack.reward.repository.DailyRewardClaimRepository;
import com.aayush.blackjack.reward.repository.RewardConfigRepository;
import com.aayush.blackjack.security.service.CurrentUserService;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.repository.UserRepository;
import com.aayush.blackjack.wallet.entity.ChipTransaction;
import com.aayush.blackjack.wallet.entity.ChipWallet;
import com.aayush.blackjack.wallet.enums.TransactionType;
import com.aayush.blackjack.wallet.repository.ChipTransactionRepository;
import com.aayush.blackjack.wallet.repository.ChipWalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DailyRewardService {
    private final RewardConfigRepository rewardConfigRepository;
    private final DailyRewardClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final ChipTransactionRepository chipTransactionRepository;
    private final ChipWalletRepository chipWalletRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public DailyRewardStatusResponse getStatus() {
        UUID userId = currentUserService.getCurrentUserId();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        List<RewardConfig> allConfigs = rewardConfigRepository.findAllByOrderByDayNumberAsc();
        List<RewardConfig> activeConfigs = allConfigs.stream()
                .filter(c -> Boolean.TRUE.equals(c.getActive()))
                .toList();

        Optional<DailyRewardClaim> latestClaimOpt = claimRepository.findTopByUser_IdOrderByRewardDateDesc(userId);
        boolean claimedToday = latestClaimOpt
                .map(c -> today.equals(c.getRewardDate()))
                .orElse(false);

        int currentStreakDay = resolveCurrentStreakDay(latestClaimOpt.orElse(null), today, claimedToday);
        RewardConfig nextConfig = resolveNextActiveReward(
                latestClaimOpt.orElse(null),
                allConfigs,
                activeConfigs,
                today,
                claimedToday
        );

        long balance = chipWalletRepository.findByUser_Id(userId)
                .map(ChipWallet::getBalance)
                .orElse(0L);

        List<DailyRewardClaimResponse> recentClaims = claimRepository.findAllByUser_IdOrderByRewardDateDesc(userId)
                .stream()
                .limit(15)
                .map(c -> DailyRewardClaimResponse.from(c, balance))
                .toList();

        return new DailyRewardStatusResponse(
                today,
                claimedToday,
                currentStreakDay,
                nextConfig != null ? nextConfig.getDayNumber() : 1,
                nextConfig != null ? nextConfig.getChipsReward() : 0L,
                allConfigs.size(),
                balance,
                allConfigs.stream().map(RewardConfigResponse::from).toList(),
                recentClaims
        );
    }

    @Transactional
    public DailyRewardClaimResponse claimToday() {
        UUID userId = currentUserService.getCurrentUserId();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        if (claimRepository.existsByUser_IdAndRewardDate(userId, today)) {
            throw new IllegalStateException("Daily reward has already been claimed for " + today);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<RewardConfig> allConfigs = rewardConfigRepository.findAllByOrderByDayNumberAsc();
        List<RewardConfig> activeConfigs = allConfigs.stream()
                .filter(c -> Boolean.TRUE.equals(c.getActive()))
                .toList();

        if (activeConfigs.isEmpty()) {
            throw new IllegalStateException("No active daily reward configuration available");
        }

        DailyRewardClaim latestClaim = claimRepository.findTopByUser_IdOrderByRewardDateDesc(userId).orElse(null);
        RewardConfig configToClaim = resolveNextActiveReward(
                latestClaim,
                allConfigs,
                activeConfigs,
                today,
                false
        );

        if (configToClaim == null) {
            throw new IllegalStateException("Unable to determine daily reward config");
        }

        ChipWallet wallet = chipWalletRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    ChipWallet w = new ChipWallet();
                    w.setUser(user);
                    w.setBalance(0L);
                    return w;
                });

        long rewardChips = configToClaim.getChipsReward();
        long updatedBalance = wallet.getBalance() + rewardChips;
        wallet.setBalance(updatedBalance);
        chipWalletRepository.save(wallet);

        DailyRewardClaim claim = new DailyRewardClaim();
        claim.setUser(user);
        claim.setRewardConfig(configToClaim);
        claim.setRewardDate(today);
        claim.setChipsCredited(rewardChips);
        DailyRewardClaim savedClaim = claimRepository.save(claim);

        ChipTransaction txn = new ChipTransaction();
        txn.setUser(user);
        txn.setDailyRewardClaim(savedClaim);
        txn.setType(TransactionType.REWARD_CLAIM);
        txn.setAmount(rewardChips);
        txn.setBalanceAfter(updatedBalance);
        txn.setReferenceKey("txn:reward:" + userId + ":" + today);
        chipTransactionRepository.save(txn);

        return DailyRewardClaimResponse.from(savedClaim, updatedBalance);
    }

    private int resolveCurrentStreakDay(DailyRewardClaim latestClaim, LocalDate today, boolean claimedToday) {
        if (latestClaim == null) {
            return 0;
        }
        if (claimedToday) {
            return latestClaim.getRewardConfig().getDayNumber();
        }
        if (today.minusDays(1).equals(latestClaim.getRewardDate())) {
            return latestClaim.getRewardConfig().getDayNumber();
        }

        return 0;
    }

    private RewardConfig resolveNextActiveReward(
            DailyRewardClaim latestClaim,
            List<RewardConfig> allConfigs,
            List<RewardConfig> activeConfigs,
            LocalDate today,
            boolean claimedToday
    ) {
        if (activeConfigs.isEmpty()) {
            return null;
        }

        if (claimedToday && latestClaim != null) {
            return latestClaim.getRewardConfig();
        }

        boolean consecutiveYesterday = latestClaim != null && today.minusDays(1).equals(latestClaim.getRewardDate());

        if (!consecutiveYesterday) {
            return activeConfigs.getFirst();
        }

        int lastDay = latestClaim.getRewardConfig().getDayNumber();
        int maxDay = allConfigs.isEmpty() ? activeConfigs.size() : allConfigs.getLast().getDayNumber();

        if (lastDay >= maxDay) {
            return activeConfigs.getFirst();
        }

        return activeConfigs.stream()
                .filter(c -> c.getDayNumber() > lastDay)
                .findFirst()
                .orElse(activeConfigs.getFirst());
    }
}
