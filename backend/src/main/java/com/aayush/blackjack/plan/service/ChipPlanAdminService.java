package com.aayush.blackjack.plan.service;

import com.aayush.blackjack.admin.service.AdminAuditService;
import com.aayush.blackjack.payment.repository.PurchaseRepository;
import com.aayush.blackjack.plan.dto.ChipPlanResponse;
import com.aayush.blackjack.plan.dto.CreateChipPlanRequest;
import com.aayush.blackjack.plan.dto.UpdateChipPlanRequest;
import com.aayush.blackjack.plan.entity.ChipPlan;
import com.aayush.blackjack.plan.repository.ChipPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChipPlanAdminService {

    private static final String ENTITY_TYPE = "CHIP_PLAN";

    private final ChipPlanRepository chipPlanRepository;
    private final AdminAuditService adminAuditService;
    private final PurchaseRepository purchaseRepository;

    @Transactional(readOnly = true)
    @Caching(cacheable = {@Cacheable(cacheNames = "plans", key = "'admin:all'")})
    public List<ChipPlanResponse> getAllPlans() {
        return chipPlanRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ChipPlanResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    @Caching(cacheable = {@Cacheable(cacheNames = "plans", key = "'admin:' + #planId")})
    public ChipPlanResponse getPlanById(UUID planId) {
        ChipPlan plan = findPlanOrThrow(planId);
        return ChipPlanResponse.from(plan);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = "plans", key = "'active'"),
            @CacheEvict(cacheNames = "plans", key = "'admin:all'")
    })
    public ChipPlanResponse createPlan(CreateChipPlanRequest request) {
        String normalizedName = request.name().trim();
        if (chipPlanRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new IllegalArgumentException("A chip plan with name '" + normalizedName + "' already exists");
        }

        validateSaleWindow(request.salePriceInPaise(), request.saleStartAt(), request.saleEndAt());

        ChipPlan plan = new ChipPlan();
        plan.setName(normalizedName);
        plan.setDescription(request.description());
        plan.setChips(request.chips());
        plan.setBonusChips(request.bonusChips() != null ? request.bonusChips() : 0L);
        plan.setPriceInPaise(request.priceInPaise());
        plan.setActive(request.active() != null ? request.active() : false);
        plan.setSalePriceInPaise(request.salePriceInPaise());
        plan.setSaleName(request.saleName());
        plan.setSaleStartAt(request.saleStartAt());
        plan.setSaleEndAt(request.saleEndAt());

        ChipPlan saved = chipPlanRepository.save(plan);

        adminAuditService.log(
                "CREATE_CHIP_PLAN",
                ENTITY_TYPE,
                saved.getId(),
                Map.of(),
                snapshotPlan(saved)
        );

        return ChipPlanResponse.from(saved);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = "plans", key = "'active'"),
            @CacheEvict(cacheNames = "plans", key = "'admin:all'"),
            @CacheEvict(cacheNames = "plans", key = "'active:' + #planId"),
            @CacheEvict(cacheNames = "plans", key = "'admin:' + #planId")
    })
    public ChipPlanResponse updatePlan(UUID planId, UpdateChipPlanRequest request) {
        ChipPlan plan = findPlanOrThrow(planId);
        Map<String, Object> oldValues = snapshotPlan(plan);

        if (request.name() != null) {
            String normalizedName = request.name().trim();
            if (normalizedName.isEmpty()) {
                throw new IllegalArgumentException("Plan name cannot be blank");
            }
            if (chipPlanRepository.existsByNameIgnoreCaseAndIdNot(normalizedName, planId)) {
                throw new IllegalArgumentException("A chip plan with name '" + normalizedName + "' already exists");
            }
            plan.setName(normalizedName);
        }

        if (request.description() != null) {
            plan.setDescription(request.description());
        }
        if (request.chips() != null) {
            plan.setChips(request.chips());
        }
        if (request.bonusChips() != null) {
            plan.setBonusChips(request.bonusChips());
        }
        if (request.priceInPaise() != null) {
            plan.setPriceInPaise(request.priceInPaise());
        }
        if (request.active() != null) {
            plan.setActive(request.active());
        }

        if (Boolean.TRUE.equals(request.clearSale())) {
            plan.setSalePriceInPaise(null);
            plan.setSaleName(null);
            plan.setSaleStartAt(null);
            plan.setSaleEndAt(null);
        }
        else {
            if (request.salePriceInPaise() != null) {
                plan.setSalePriceInPaise(request.salePriceInPaise());
            }
            if (request.saleName() != null) {
                plan.setSaleName(request.saleName());
            }
            if (request.saleStartAt() != null) {
                plan.setSaleStartAt(request.saleStartAt());
            }
            if (request.saleEndAt() != null) {
                plan.setSaleEndAt(request.saleEndAt());
            }
        }

        validateSaleWindow(plan.getSalePriceInPaise(), plan.getSaleStartAt(), plan.getSaleEndAt());

        ChipPlan saved = chipPlanRepository.save(plan);

        adminAuditService.log(
                "UPDATE_CHIP_PLAN",
                ENTITY_TYPE,
                saved.getId(),
                oldValues,
                snapshotPlan(saved)
        );

        return ChipPlanResponse.from(saved);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = "plans", key = "'active'"),
            @CacheEvict(cacheNames = "plans", key = "'admin:all'"),
            @CacheEvict(cacheNames = "plans", key = "'active:' + #planId"),
            @CacheEvict(cacheNames = "plans", key = "'admin:' + #planId")
    })
    public void deletePlan(UUID planId) {
        ChipPlan plan = findPlanOrThrow(planId);
        Map<String, Object> oldValues = snapshotPlan(plan);

        purchaseRepository.detachPlanFromPurchases(planId);

        chipPlanRepository.delete(plan);
        chipPlanRepository.flush();

        adminAuditService.log(
                "DELETE_CHIP_PLAN",
                ENTITY_TYPE,
                planId,
                oldValues,
                Map.of("deleted", true)
        );
    }

    private ChipPlan findPlanOrThrow(UUID planId) {
        return chipPlanRepository.findById(planId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chip plan not found"));
    }

    private void validateSaleWindow(Long salePriceInPaise, Instant saleStartAt, Instant saleEndAt) {
        if (saleStartAt != null && saleEndAt != null && !saleEndAt.isAfter(saleStartAt)) {
            throw new IllegalArgumentException("Sale end time must be after sale start time");
        }
        if (salePriceInPaise != null && salePriceInPaise < 0) {
            throw new IllegalArgumentException("Sale price cannot be negative");
        }
    }

    private Map<String, Object> snapshotPlan(ChipPlan plan) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", plan.getId());
        map.put("name", plan.getName());
        map.put("description", plan.getDescription());
        map.put("chips", plan.getChips());
        map.put("bonusChips", plan.getBonusChips());
        map.put("priceInPaise", plan.getPriceInPaise());
        map.put("active", plan.getActive());
        map.put("salePriceInPaise", plan.getSalePriceInPaise());
        map.put("saleName", plan.getSaleName());
        map.put("saleStartAt", plan.getSaleStartAt());
        map.put("saleEndAt", plan.getSaleEndAt());
        return map;
    }
}