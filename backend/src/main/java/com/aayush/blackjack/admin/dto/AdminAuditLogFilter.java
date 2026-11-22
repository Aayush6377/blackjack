package com.aayush.blackjack.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminAuditLogFilter(
        UUID adminId,
        String action,
        String entityType,
        UUID entityId,
        Instant from,
        Instant to
) {}