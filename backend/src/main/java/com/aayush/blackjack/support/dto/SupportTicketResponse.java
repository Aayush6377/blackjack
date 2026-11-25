package com.aayush.blackjack.support.dto;

import com.aayush.blackjack.support.entity.SupportTicket;
import com.aayush.blackjack.support.enums.TicketCategory;
import com.aayush.blackjack.support.enums.TicketStatus;

import java.time.Instant;
import java.util.UUID;

public record SupportTicketResponse(
        UUID id,
        UUID userId,
        String userName,
        String userEmail,
        String subject,
        TicketCategory category,
        String message,
        TicketStatus status,
        String adminResolution,
        UUID resolvedByAdminId,
        String resolvedByAdminName,
        Instant resolvedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static SupportTicketResponse from(SupportTicket ticket) {
        return new SupportTicketResponse(
                ticket.getId(),
                ticket.getUser().getId(),
                ticket.getUser().getName(),
                ticket.getUser().getEmail(),
                ticket.getSubject(),
                ticket.getCategory(),
                ticket.getMessage(),
                ticket.getStatus(),
                ticket.getAdminResolution(),
                ticket.getResolvedBy() != null ? ticket.getResolvedBy().getId() : null,
                ticket.getResolvedBy() != null ? ticket.getResolvedBy().getName() : null,
                ticket.getResolvedAt(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}