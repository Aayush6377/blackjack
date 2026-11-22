package com.aayush.blackjack.reward.service;

import com.aayush.blackjack.admin.service.AdminAuditService;
import com.aayush.blackjack.reward.dto.*;
import com.aayush.blackjack.reward.entity.DailyRewardClaim;
import com.aayush.blackjack.reward.entity.RewardConfig;
import com.aayush.blackjack.reward.repository.DailyRewardClaimRepository;
import com.aayush.blackjack.reward.repository.RewardConfigRepository;
import com.aayush.blackjack.wallet.repository.ChipTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RewardConfigAdminService {
    private static final String ENTITY_TYPE = "REWARD_CONFIG";

    private final RewardConfigRepository rewardConfigRepository;
    private final DailyRewardClaimRepository claimRepository;
    private final ChipTransactionRepository chipTransactionRepository;
    private final AdminAuditService adminAuditService;

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

        RewardConfig saved = rewardConfigRepository.findById(newConfig.getId()).orElse(newConfig);

        adminAuditService.log(
                "CREATE_REWARD_CONFIG",
                ENTITY_TYPE,
                saved.getId(),
                Map.of(),
                snapshotConfig(saved)
        );

        return RewardConfigResponse.from(saved);
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

        List<RewardConfig> savedAll = rewardConfigRepository.saveAll(existing);
        rewardConfigRepository.flush();

        Set<RewardConfig> createdSet = new HashSet<>(created);
        List<RewardConfig> savedCreated = savedAll.stream()
                .filter(createdSet::contains)
                .toList();

        Integer minDay = savedCreated.stream()
                .map(RewardConfig::getDayNumber)
                .min(Integer::compareTo)
                .orElse(null);
        Integer maxDay = savedCreated.stream()
                .map(RewardConfig::getDayNumber)
                .max(Integer::compareTo)
                .orElse(null);

        UUID targetEntityId = !savedCreated.isEmpty() ? savedCreated.get(0).getId() : null;

        Map<String, Object> auditDetails = new LinkedHashMap<>();
        auditDetails.put("count", savedCreated.size());
        auditDetails.put("startDay", minDay);
        auditDetails.put("endDay", maxDay);
        auditDetails.put("active", activeFlag);
        auditDetails.put("items", savedCreated.stream().map(this::snapshotConfig).toList());

        adminAuditService.log(
                "BULK_CREATE_REWARD_CONFIG",
                ENTITY_TYPE,
                targetEntityId,
                Map.of(),
                auditDetails
        );

        return rewardConfigRepository.findAllByOrderByDayNumberAsc()
                .stream()
                .map(RewardConfigResponse::from)
                .toList();
    }

    @Transactional
    public RewardConfigResponse update(UUID id, UpdateRewardConfigRequest request) {
        RewardConfig target = rewardConfigRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("RewardConfig not found: " + id));

        Map<String, Object> oldValues = snapshotConfig(target);

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

        adminAuditService.log(
                "UPDATE_REWARD_CONFIG",
                ENTITY_TYPE,
                refreshed.getId(),
                oldValues,
                snapshotConfig(refreshed)
        );

        return RewardConfigResponse.from(refreshed);
    }

    @Transactional
    public List<RewardConfigResponse> delete(UUID id) {
        RewardConfig target = rewardConfigRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("RewardConfig not found: " + id));

        Map<String, Object> oldValues = snapshotConfig(target);

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

        adminAuditService.log(
                "DELETE_REWARD_CONFIG",
                ENTITY_TYPE,
                id,
                oldValues,
                Map.of("deleted", true)
        );

        return rewardConfigRepository.findAllByOrderByDayNumberAsc()
                .stream()
                .map(RewardConfigResponse::from)
                .toList();
    }

    @Transactional
    public BulkDeleteRewardConfigResponse bulkDelete(BulkDeleteRewardConfigRequest request) {
        if (request == null || (!request.hasExplicitDays() && !request.hasRange())) {
            throw new IllegalArgumentException("Provide either dayNumbers or startDay/endDay to bulk delete reward configurations.");
        }

        if (request.startDay() != null && request.endDay() != null && request.endDay() < request.startDay()) {
            throw new IllegalArgumentException("endDay must be greater than or equal to startDay.");
        }

        if ((request.startDay() != null && request.endDay() == null) || (request.startDay() == null && request.endDay() != null)) {
            throw new IllegalArgumentException("Both startDay and endDay are required for range deletion.");
        }

        Set<Integer> targetDays = new TreeSet<>();

        if (request.hasExplicitDays()) {
            targetDays.addAll(request.dayNumbers());
        }

        if (request.startDay() != null && request.endDay() != null) {
            for (int d = request.startDay(); d <= request.endDay(); d++) {
                targetDays.add(d);
            }
        }

        List<RewardConfig> allConfigs = new ArrayList<>(rewardConfigRepository.findAllByOrderByDayNumberAsc());

        List<RewardConfig> toDelete = allConfigs.stream()
                .filter(cfg -> targetDays.contains(cfg.getDayNumber()))
                .toList();

        if (toDelete.isEmpty()) {
            throw new IllegalArgumentException("No matching reward configurations found for the specified days.");
        }

        List<Integer> deletedDayNumbers = toDelete.stream()
                .map(RewardConfig::getDayNumber)
                .sorted()
                .toList();

        UUID primaryDeletedId = toDelete.get(0).getId();

        List<DailyRewardClaim> allLinkedClaims = new ArrayList<>();
        for (RewardConfig cfg : toDelete) {
            allLinkedClaims.addAll(claimRepository.findAllByRewardConfig_Id(cfg.getId()));
        }

        if (!allLinkedClaims.isEmpty()) {
            List<UUID> claimIds = allLinkedClaims.stream()
                    .map(DailyRewardClaim::getId)
                    .toList();

            chipTransactionRepository.clearDailyRewardClaimReferences(claimIds);
            claimRepository.deleteAllInBatch(allLinkedClaims);
            claimRepository.flush();
        }

        rewardConfigRepository.deleteAllInBatch(toDelete);
        rewardConfigRepository.flush();

        List<RewardConfig> remaining = allConfigs.stream()
                .filter(cfg -> !targetDays.contains(cfg.getDayNumber()))
                .collect(Collectors.toCollection(ArrayList::new));

        reindexConsecutiveDays(remaining);
        rewardConfigRepository.saveAll(remaining);
        rewardConfigRepository.flush();

        Map<String, Object> auditDetails = new LinkedHashMap<>();
        auditDetails.put("deletedCount", toDelete.size());
        auditDetails.put("deletedDayNumbers", deletedDayNumbers);

        adminAuditService.log(
                "BULK_DELETE_REWARD_CONFIG",
                ENTITY_TYPE,
                primaryDeletedId,
                Map.of(),
                auditDetails
        );

        List<RewardConfigResponse> updatedSchedule = rewardConfigRepository.findAllByOrderByDayNumberAsc()
                .stream()
                .map(RewardConfigResponse::from)
                .toList();

        return new BulkDeleteRewardConfigResponse(
                toDelete.size(),
                deletedDayNumbers,
                updatedSchedule
        );
    }

    private Map<String, Object> snapshotConfig(RewardConfig config) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", config.getId());
        map.put("dayNumber", config.getDayNumber());
        map.put("chipsReward", config.getChipsReward());
        map.put("active", config.getActive());
        return map;
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
