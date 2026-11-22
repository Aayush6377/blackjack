package com.aayush.blackjack.admin.controller;

import com.aayush.blackjack.admin.dto.AdminAuditLogFilter;
import com.aayush.blackjack.admin.dto.AdminAuditLogResponse;
import com.aayush.blackjack.admin.service.AdminAuditQueryService;
import com.aayush.blackjack.common.dto.PageRequest;
import com.aayush.blackjack.common.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditController {

    private final AdminAuditQueryService adminAuditQueryService;

    @PostMapping("/search")
    public ResponseEntity<PageResponse<AdminAuditLogResponse>> getAuditLogs(
            @RequestBody(required = false) PageRequest<AdminAuditLogFilter> request
    ) {
        return ResponseEntity.ok(adminAuditQueryService.getAuditLogs(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminAuditLogResponse> getLogById(@PathVariable UUID id) {
        return ResponseEntity.ok(adminAuditQueryService.getAuditLogById(id));
    }
}