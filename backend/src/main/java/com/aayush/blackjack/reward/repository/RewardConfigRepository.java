package com.aayush.blackjack.reward.repository;

import com.aayush.blackjack.reward.entity.RewardConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface RewardConfigRepository extends JpaRepository<RewardConfig, UUID> {

    List<RewardConfig> findAllByOrderByDayNumberAsc();
}
