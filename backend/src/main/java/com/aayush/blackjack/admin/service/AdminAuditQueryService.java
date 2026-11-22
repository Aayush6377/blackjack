package com.aayush.blackjack.admin.service;

import com.aayush.blackjack.admin.dto.AdminAuditLogFilter;
import com.aayush.blackjack.admin.dto.AdminAuditLogResponse;
import com.aayush.blackjack.admin.entity.AdminAuditLog;
import com.aayush.blackjack.admin.repository.AdminAuditLogRepository;
import com.aayush.blackjack.admin.specification.AdminAuditSpecification;
import com.aayush.blackjack.common.dto.PageRequest;
import com.aayush.blackjack.common.dto.PageResponse;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminAuditQueryService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "createdAt",
            "action",
            "entityType",
            "entityId"
    );

    private final AdminAuditLogRepository adminAuditLogRepository;
    private final AdminAuditSpecification adminAuditSpecification;

    @Transactional(readOnly = true)
    public PageResponse<AdminAuditLogResponse> getAuditLogs(
            PageRequest<AdminAuditLogFilter> request
    ) {
        PageRequest<AdminAuditLogFilter> safeRequest = request != null
                ? request
                : new PageRequest<>(null, null, null, null, null, null);

        Pageable pageable = safeRequest.toPageable(ALLOWED_SORT_FIELDS, "createdAt");
        Specification<AdminAuditLog> spec = adminAuditSpecification.buildSpecification(
                safeRequest.normalizedSearch(),
                safeRequest.filters()
        );

        Page<AdminAuditLog> pageData = adminAuditLogRepository.findAll(spec, pageable);
        return PageResponse.from(pageData, AdminAuditLogResponse::from);
    }

    @Transactional(readOnly = true)
    public AdminAuditLogResponse getAuditLogById(UUID id) {
        AdminAuditLog log = adminAuditLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Audit log not found: " + id));
        return AdminAuditLogResponse.from(log);
    }
}