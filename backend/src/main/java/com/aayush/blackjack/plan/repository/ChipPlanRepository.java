package com.aayush.blackjack.plan.repository;

import com.aayush.blackjack.plan.entity.ChipPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChipPlanRepository extends JpaRepository<ChipPlan, UUID> {

}
