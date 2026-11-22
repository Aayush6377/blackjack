package com.aayush.blackjack.plan.service;

import com.aayush.blackjack.plan.dto.ChipPlanResponse;
import com.aayush.blackjack.plan.entity.ChipPlan;
import com.aayush.blackjack.plan.repository.ChipPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChipPlanService {

    private final ChipPlanRepository chipPlanRepository;

    @Transactional(readOnly = true)
    @Caching(cacheable = {@Cacheable(cacheNames = "plans", key = "'active'")})
    public List<ChipPlanResponse> getActivePlans() {
        return chipPlanRepository.findAllByActiveTrueOrderByPriceInPaiseAsc()
                .stream()
                .map(ChipPlanResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    @Caching(cacheable = {@Cacheable(cacheNames = "plans", key = "'active:' + #planId")})
    public ChipPlanResponse getActivePlanById(UUID planId) {
        ChipPlan plan = chipPlanRepository.findByIdAndActiveTrue(planId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chip plan not found"));
        return ChipPlanResponse.from(plan);
    }
}