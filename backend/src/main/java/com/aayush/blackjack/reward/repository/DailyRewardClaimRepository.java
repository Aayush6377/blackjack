package com.aayush.blackjack.reward.repository;

import com.aayush.blackjack.reward.entity.DailyRewardClaim;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DailyRewardClaimRepository extends JpaRepository<DailyRewardClaim, UUID> {

    Optional<DailyRewardClaim> findTopByUser_IdOrderByRewardDateDesc(UUID userId);

    List<DailyRewardClaim> findAllByUser_IdOrderByRewardDateDesc(UUID userId);

    boolean existsByUser_IdAndRewardDate(UUID userId, LocalDate today);

    List<DailyRewardClaim> findAllByRewardConfig_Id(UUID rewardConfigId);

    void deleteByUser_Id(UUID userId);
}
