package com.aayush.blackjack.admin.service;

import com.aayush.blackjack.admin.entity.AdminAuditLog;
import com.aayush.blackjack.admin.repository.AdminAuditLogRepository;
import com.aayush.blackjack.security.service.CurrentUserService;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminAuditService {

    private final AdminAuditLogRepository adminAuditLogRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @Transactional(propagation = Propagation.MANDATORY)
    public void log(
            String action,
            String entityType,
            UUID entityId,
            Map<String, Object> oldValues,
            Map<String, Object> newValues
    ) {
        UUID adminId = currentUserService.getCurrentUserId();
        logForAdmin(adminId, action, entityType, entityId, oldValues, newValues);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void logForAdmin(
            UUID adminId,
            String action,
            String entityType,
            UUID entityId,
            Map<String, Object> oldValues,
            Map<String, Object> newValues
    ) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found: " + adminId));

        AdminAuditLog entry = new AdminAuditLog();
        entry.setAdmin(admin);
        entry.setAction(action);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setOldValues(sanitizeMap(oldValues));
        entry.setNewValues(sanitizeMap(newValues));

        adminAuditLogRepository.save(entry);
    }

    private Map<String, Object> sanitizeMap(Map<String, Object> source) {
        Map<String, Object> copy = new LinkedHashMap<>();
        if (source == null || source.isEmpty()) {
            return copy;
        }
        source.forEach((k, v) -> {
            if (v instanceof Instant instant) {
                copy.put(k, instant.toString());
            } else if (v instanceof UUID uuid) {
                copy.put(k, uuid.toString());
            } else if (v instanceof Enum<?> e) {
                copy.put(k, e.name());
            } else {
                copy.put(k, v);
            }
        });
        return copy;
    }
}