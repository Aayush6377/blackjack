package com.aayush.blackjack.plan.controller;

import com.aayush.blackjack.plan.dto.ChipPlanResponse;
import com.aayush.blackjack.plan.service.ChipPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/plans")
@RequiredArgsConstructor
public class ChipPlanController {

    private final ChipPlanService chipPlanService;

    @GetMapping
    public ResponseEntity<List<ChipPlanResponse>> getActivePlans() {
        return ResponseEntity.ok(chipPlanService.getActivePlans());
    }

    @GetMapping("/{planId}")
    public ResponseEntity<ChipPlanResponse> getActivePlanById(@PathVariable UUID planId) {
        return ResponseEntity.ok(chipPlanService.getActivePlanById(planId));
    }
}