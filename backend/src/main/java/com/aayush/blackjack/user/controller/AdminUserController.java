package com.aayush.blackjack.user.controller;

import com.aayush.blackjack.common.dto.PageRequest;
import com.aayush.blackjack.common.dto.PageResponse;
import com.aayush.blackjack.payment.dto.PurchaseHistoryResponse;
import com.aayush.blackjack.user.dto.AdjustUserChipsRequest;
import com.aayush.blackjack.user.dto.AdjustUserChipsResponse;
import com.aayush.blackjack.user.dto.AdminUserDetailResponse;
import com.aayush.blackjack.user.dto.AdminUserSummaryResponse;
import com.aayush.blackjack.user.dto.UpdateUserStatusRequest;
import com.aayush.blackjack.user.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<PageResponse<AdminUserSummaryResponse>> getUsers(
            @ModelAttribute PageRequest<Void> pageRequest
    ) {
        return ResponseEntity.ok(adminUserService.getUsers(pageRequest));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<AdminUserDetailResponse> getUserDetails(
            @PathVariable UUID userId
    ) {
        return ResponseEntity.ok(adminUserService.getUserDetails(userId));
    }

    @GetMapping("/{userId}/purchases")
    public ResponseEntity<PageResponse<PurchaseHistoryResponse>> getUserPurchases(
            @PathVariable UUID userId,
            @ModelAttribute PageRequest<Void> pageRequest
    ) {
        return ResponseEntity.ok(adminUserService.getUserPurchases(userId, pageRequest));
    }

    @PatchMapping("/{userId}/enabled")
    public ResponseEntity<AdminUserSummaryResponse> updateUserEnabled(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        return ResponseEntity.ok(
                adminUserService.updateUserEnabledStatus(userId, request.enabled())
        );
    }

    @PostMapping("/{userId}/chips/adjust")
    public ResponseEntity<AdjustUserChipsResponse> adjustUserChips(
            @PathVariable UUID userId,
            @Valid @RequestBody AdjustUserChipsRequest request
    ) {
        return ResponseEntity.ok(adminUserService.adjustUserChips(userId, request));
    }
}