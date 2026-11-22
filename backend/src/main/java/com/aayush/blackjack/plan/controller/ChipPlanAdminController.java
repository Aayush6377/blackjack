package com.aayush.blackjack.plan.controller;

import com.aayush.blackjack.plan.dto.ChipPlanResponse;
import com.aayush.blackjack.plan.dto.CreateChipPlanRequest;
import com.aayush.blackjack.plan.dto.UpdateChipPlanRequest;
import com.aayush.blackjack.plan.service.ChipPlanAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/plans")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ChipPlanAdminController {

    private final ChipPlanAdminService chipPlanAdminService;

    @GetMapping
    public ResponseEntity<List<ChipPlanResponse>> getAllPlans() {
        return ResponseEntity.ok(chipPlanAdminService.getAllPlans());
    }

    @GetMapping("/{planId}")
    public ResponseEntity<ChipPlanResponse> getPlanById(@PathVariable UUID planId) {
        return ResponseEntity.ok(chipPlanAdminService.getPlanById(planId));
    }

    @PostMapping
    public ResponseEntity<ChipPlanResponse> createPlan(
            @Valid @RequestBody CreateChipPlanRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chipPlanAdminService.createPlan(request));
    }

    @PutMapping("/{planId}")
    public ResponseEntity<ChipPlanResponse> updatePlan(
            @PathVariable UUID planId,
            @Valid @RequestBody UpdateChipPlanRequest request
    ) {
        return ResponseEntity.ok(chipPlanAdminService.updatePlan(planId, request));
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable UUID planId) {
        chipPlanAdminService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }
}