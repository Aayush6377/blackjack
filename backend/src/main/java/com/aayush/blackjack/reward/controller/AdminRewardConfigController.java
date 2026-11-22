package com.aayush.blackjack.reward.controller;

import com.aayush.blackjack.reward.dto.*;
import com.aayush.blackjack.reward.service.RewardConfigAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/rewards/configs")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminRewardConfigController {

    private final RewardConfigAdminService adminService;

    @GetMapping
    public ResponseEntity<List<RewardConfigResponse>> listConfigs() {
        return ResponseEntity.ok(adminService.listAll());
    }

    @PostMapping
    public ResponseEntity<RewardConfigResponse> createConfig(
            @Valid @RequestBody CreateRewardConfigRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.create(request));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<RewardConfigResponse>> bulkCreateConfigs(
            @Valid @RequestBody BulkCreateRewardConfigRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.bulkCreate(request));
    }

    @PutMapping("/{configId}")
    public ResponseEntity<RewardConfigResponse> updateConfig(
            @PathVariable UUID configId,
            @Valid @RequestBody UpdateRewardConfigRequest request
    ) {
        return ResponseEntity.ok(adminService.update(configId, request));
    }

    @DeleteMapping("/{configId}")
    public ResponseEntity<List<RewardConfigResponse>> deleteConfig(@PathVariable UUID configId) {
        return ResponseEntity.ok(adminService.delete(configId));
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<BulkDeleteRewardConfigResponse> bulkDelete(
            @Valid @RequestBody BulkDeleteRewardConfigRequest request
    ) {
        return ResponseEntity.ok(adminService.bulkDelete(request));
    }
}