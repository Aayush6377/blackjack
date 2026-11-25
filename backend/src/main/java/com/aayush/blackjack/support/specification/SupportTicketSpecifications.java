package com.aayush.blackjack.support.repository;

import com.aayush.blackjack.support.entity.SupportTicket;
import com.aayush.blackjack.support.enums.TicketCategory;
import com.aayush.blackjack.support.enums.TicketStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public final class SupportTicketSpecifications {

    private SupportTicketSpecifications() {}

    public static Specification<SupportTicket> belongsToUser(UUID userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<SupportTicket> hasStatus(TicketStatus status) {
        return (root, query, cb) -> status == null
                ? null
                : cb.equal(root.get("status"), status);
    }

    public static Specification<SupportTicket> hasCategory(TicketCategory category) {
        return (root, query, cb) -> category == null
                ? null
                : cb.equal(root.get("category"), category);
    }

    public static Specification<SupportTicket> matchesSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("subject")), pattern),
                    cb.like(cb.lower(root.get("message")), pattern),
                    cb.like(cb.lower(root.get("user").get("name")), pattern),
                    cb.like(cb.lower(root.get("user").get("email")), pattern)
            );
        };
    }
}