package com.aayush.blackjack.admin.specification;

import com.aayush.blackjack.admin.dto.AdminAuditLogFilter;
import com.aayush.blackjack.admin.entity.AdminAuditLog;
import com.aayush.blackjack.user.entity.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
public class AdminAuditSpecification {

    public Specification<AdminAuditLog> buildSpecification(
            String search,
            AdminAuditLogFilter filters
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && Long.class != query.getResultType() && long.class != query.getResultType()) {
                query.distinct(true);
            }

            if (filters != null) {
                if (filters.adminId() != null) {
                    predicates.add(cb.equal(root.get("admin").get("id"), filters.adminId()));
                }
                if (filters.action() != null && !filters.action().isBlank()) {
                    String actionPrefix = filters.action().trim().toUpperCase(Locale.ROOT) + "%";
                    predicates.add(cb.like(cb.upper(root.get("action")), actionPrefix));
                }
                if (filters.entityType() != null && !filters.entityType().isBlank()) {
                    predicates.add(cb.equal(
                            cb.upper(root.get("entityType")),
                            filters.entityType().trim().toUpperCase(Locale.ROOT)
                    ));
                }
                if (filters.entityId() != null) {
                    predicates.add(cb.equal(root.get("entityId"), filters.entityId()));
                }
                if (filters.from() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filters.from()));
                }
                if (filters.to() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filters.to()));
                }
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                Join<AdminAuditLog, User> adminJoin = root.join("admin", JoinType.LEFT);

                Predicate actionMatch = cb.like(cb.lower(root.get("action")), pattern);
                Predicate entityTypeMatch = cb.like(cb.lower(root.get("entityType")), pattern);
                Predicate entityIdMatch = cb.like(
                        cb.lower(cb.function("text", String.class, root.get("entityId"))),
                        pattern
                );
                Predicate adminNameMatch = cb.like(cb.lower(adminJoin.get("name")), pattern);
                Predicate adminEmailMatch = cb.like(cb.lower(adminJoin.get("email")), pattern);

                predicates.add(
                        cb.or(
                                actionMatch,
                                entityTypeMatch,
                                entityIdMatch,
                                adminNameMatch,
                                adminEmailMatch
                        )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}