package com.aayush.blackjack.reward.service;

import com.aayush.blackjack.reward.dto.BulkCreateRewardConfigRequest;
import com.aayush.blackjack.reward.dto.CreateRewardConfigRequest;
import com.aayush.blackjack.reward.dto.RewardConfigResponse;
import com.aayush.blackjack.reward.dto.UpdateRewardConfigRequest;
import com.aayush.blackjack.reward.entity.DailyRewardClaim;
import com.aayush.blackjack.reward.entity.RewardConfig;
import com.aayush.blackjack.reward.repository.DailyRewardClaimRepository;
import com.aayush.blackjack.reward.repository.RewardConfigRepository;
import com.aayush.blackjack.wallet.repository.ChipTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RewardConfigAdminService {
    private final RewardConfigRepository rewardConfigRepository;
    private final DailyRewardClaimRepository claimRepository;
    private final ChipTransactionRepository chipTransactionRepository;

    @Transactional(readOnly = true)
    public List<RewardConfigResponse> listAll() {
        return rewardConfigRepository.findAllByOrderByDayNumberAsc()
                .stream()
                .map(RewardConfigResponse::from)
                .toList();
    }

    @Transactional
    public RewardConfigResponse create(CreateRewardConfigRequest request) {
        List<RewardConfig> ordered = new ArrayList<>(rewardConfigRepository.findAllByOrderByDayNumberAsc());

        RewardConfig newConfig = new RewardConfig();
        newConfig.setChipsReward(request.chipsReward());
        newConfig.setActive(request.active() != null ? request.active() : true);

        int targetIndex = request.dayNumber() != null
                ? Math.clamp(request.dayNumber() - 1, 0, ordered.size())
                : ordered.size();

        ordered.add(targetIndex, newConfig);
        reindexConsecutiveDays(ordered);

        RewardConfig saved = rewardConfigRepository.save(newConfig);
        return RewardConfigResponse.from(newConfig);
    }

    @Transactional
    public List<RewardConfigResponse> bulkCreate(BulkCreateRewardConfigRequest request) {
        List<RewardConfig> existing = new ArrayList<>(rewardConfigRepository.findAllByOrderByDayNumberAsc());
        long step = request.incrementPerDay() != null ? request.incrementPerDay() : 0L;
        boolean activeFlag = request.active() != null ? request.active() : true;

        List<RewardConfig> created = new ArrayList<>();
        for (int i = 0; i < request.days(); i++) {
            long reward = (request.explicitRewards() != null && i < request.explicitRewards().size())
                    ? request.explicitRewards().get(i)
                    : request.baseChipsReward() + (step * i);

            if (reward <= 0) {
                throw new IllegalArgumentException("Computed chipsReward must be positive for day index " + (i + 1));
            }

            RewardConfig cfg = new RewardConfig();
            cfg.setChipsReward(reward);
            cfg.setActive(activeFlag);
            created.add(cfg);
        }

        int insertAt = request.startDay() != null
                ? Math.clamp(request.startDay() - 1, 0, existing.size())
                : existing.size();

        existing.addAll(insertAt, created);
        reindexConsecutiveDays(existing);

        List<RewardConfig> allSaved = rewardConfigRepository.findAllByOrderByDayNumberAsc();
        return allSaved.stream().map(RewardConfigResponse::from).toList();
    }

    @Transactional
    public RewardConfigResponse update(UUID id, UpdateRewardConfigRequest request) {
        RewardConfig target = rewardConfigRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("RewardConfig not found: " + id));

        if (request.chipsReward() != null) {
            target.setChipsReward(request.chipsReward());
        }
        if (request.active() != null) {
            target.setActive(request.active());
        }

        List<RewardConfig> ordered = new ArrayList<>(rewardConfigRepository.findAllByOrderByDayNumberAsc());
        ordered.removeIf(item -> item.getId().equals(target.getId()));

        if (request.dayNumber() != null) {
            int targetIndex = Math.clamp(request.dayNumber() - 1, 0, ordered.size());
            ordered.add(targetIndex, target);
        } else {
            int originalIndex = Math.clamp(target.getDayNumber() - 1, 0, ordered.size());
            ordered.add(originalIndex, target);
        }

        reindexConsecutiveDays(ordered);
        RewardConfig refreshed = rewardConfigRepository.findById(id).orElseThrow();
        return RewardConfigResponse.from(refreshed);
    }

    @Transactional
    public List<RewardConfigResponse> delete(UUID id) {
        RewardConfig target = rewardConfigRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("RewardConfig not found: " + id));

        List<DailyRewardClaim> linkedClaims = claimRepository.findAllByRewardConfig_Id(id);
        if (!linkedClaims.isEmpty()) {
            List<UUID> claimIds = linkedClaims.stream()
                    .map(DailyRewardClaim::getId)
                    .toList();

            chipTransactionRepository.clearDailyRewardClaimReferences(claimIds);
            claimRepository.deleteAllInBatch(linkedClaims);
            claimRepository.flush();
        }

        rewardConfigRepository.delete(target);
        rewardConfigRepository.flush();

        List<RewardConfig> remaining = new ArrayList<>(rewardConfigRepository.findAllByOrderByDayNumberAsc());
        remaining.sort(Comparator.comparingInt(RewardConfig::getDayNumber));
        reindexConsecutiveDays(remaining);

        return rewardConfigRepository.findAllByOrderByDayNumberAsc()
                .stream()
                .map(RewardConfigResponse::from)
                .toList();
    }

    private void reindexConsecutiveDays(List<RewardConfig> ordered) {
        for (int i = 0; i < ordered.size(); i++) {
            ordered.get(i).setDayNumber(-(i + 1));
        }
        rewardConfigRepository.saveAllAndFlush(ordered);

        for (int i = 0; i < ordered.size(); i++) {
            ordered.get(i).setDayNumber(i + 1);
        }
        rewardConfigRepository.saveAllAndFlush(ordered);
    }
}
