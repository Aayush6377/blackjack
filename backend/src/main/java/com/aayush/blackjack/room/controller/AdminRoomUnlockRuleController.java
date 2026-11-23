package com.aayush.blackjack.room.controller;

import com.aayush.blackjack.room.dto.AdminRoomUnlockRuleDto;
import com.aayush.blackjack.room.dto.CreateRoomUnlockRuleRequest;
import com.aayush.blackjack.room.dto.UpdateRoomUnlockRuleRequest;
import com.aayush.blackjack.room.service.AdminRoomUnlockRuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/rooms/{roomId}/unlock-rules")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRoomUnlockRuleController {

    private final AdminRoomUnlockRuleService adminRoomUnlockRuleService;

    @GetMapping
    public ResponseEntity<List<AdminRoomUnlockRuleDto>> listRules(@PathVariable UUID roomId) {
        return ResponseEntity.ok(adminRoomUnlockRuleService.listRulesForRoom(roomId));
    }

    @GetMapping("/{ruleId}")
    public ResponseEntity<AdminRoomUnlockRuleDto> getRule(
            @PathVariable UUID roomId,
            @PathVariable UUID ruleId
    ) {
        return ResponseEntity.ok(adminRoomUnlockRuleService.getRuleById(roomId, ruleId));
    }

    @PostMapping
    public ResponseEntity<AdminRoomUnlockRuleDto> createRule(
            @PathVariable UUID roomId,
            @Valid @RequestBody CreateRoomUnlockRuleRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminRoomUnlockRuleService.createRule(roomId, request));
    }

    @PutMapping("/{ruleId}")
    public ResponseEntity<AdminRoomUnlockRuleDto> updateRule(
            @PathVariable UUID roomId,
            @PathVariable UUID ruleId,
            @Valid @RequestBody UpdateRoomUnlockRuleRequest request
    ) {
        return ResponseEntity.ok(adminRoomUnlockRuleService.updateRule(roomId, ruleId, request));
    }

    @DeleteMapping("/{ruleId}")
    public ResponseEntity<Void> deleteRule(
            @PathVariable UUID roomId,
            @PathVariable UUID ruleId
    ) {
        adminRoomUnlockRuleService.deleteRule(roomId, ruleId);
        return ResponseEntity.noContent().build();
    }
}