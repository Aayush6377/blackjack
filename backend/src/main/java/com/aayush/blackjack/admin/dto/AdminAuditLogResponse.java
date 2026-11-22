package com.aayush.blackjack.admin.dto;

import com.aayush.blackjack.admin.entity.AdminAuditLog;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record AdminAuditLogResponse(
        UUID id,
        UUID adminId,
        String adminUsername,
        String action,
        String entityType,
        UUID entityId,
        Map<String, Object> oldValues,
        Map<String, Object> newValues,
        Instant createdAt
) {
    public static AdminAuditLogResponse from(AdminAuditLog log) {
        return new AdminAuditLogResponse(
                log.getId(),
                log.getAdmin() != null ? log.getAdmin().getId() : null,
                log.getAdmin() != null ? log.getAdmin().getName() : null,
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getOldValues(),
                log.getNewValues(),
                log.getCreatedAt()
        );
    }
}