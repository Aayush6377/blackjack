package com.aayush.blackjack.plan.repository;

import com.aayush.blackjack.plan.entity.ChipPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChipPlanRepository extends JpaRepository<ChipPlan, UUID> {
    List<ChipPlan> findAllByActiveTrueOrderByPriceInPaiseAsc();

    Optional<ChipPlan> findByIdAndActiveTrue(UUID id);

    List<ChipPlan> findAllByOrderByCreatedAtDesc();

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);
}
