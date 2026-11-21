package com.aayush.blackjack.admin.entity;

import com.aayush.blackjack.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "admin_audit_logs", indexes = {
        @Index(name = "idx_audit_admin", columnList = "admin_id"),
        @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id")
})
@Getter
@Setter
@NoArgsConstructor
public class AdminAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(nullable = false, length = 100)
    private String entityType;

    @Column(nullable = false)
    private UUID entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> oldValues = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> newValues = new HashMap<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
