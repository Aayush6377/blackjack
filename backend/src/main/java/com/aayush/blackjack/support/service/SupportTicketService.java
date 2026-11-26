package com.aayush.blackjack.support.service;

import com.aayush.blackjack.common.dto.PageRequest;
import com.aayush.blackjack.common.dto.PageResponse;
import com.aayush.blackjack.security.service.CurrentUserService;
import com.aayush.blackjack.support.dto.CreateSupportTicketRequest;
import com.aayush.blackjack.support.dto.ResolveSupportTicketRequest;
import com.aayush.blackjack.support.dto.SupportTicketFilter;
import com.aayush.blackjack.support.dto.SupportTicketResponse;
import com.aayush.blackjack.support.entity.SupportTicket;
import com.aayush.blackjack.support.enums.TicketStatus;
import com.aayush.blackjack.support.repository.SupportTicketRepository;
import com.aayush.blackjack.support.specification.SupportTicketSpecifications;
import com.aayush.blackjack.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "createdAt", "updatedAt", "resolvedAt", "status", "category", "subject"
    );

    private static final int MAX_TICKETS_PER_DAY = 2;
    private static final ZoneId SUPPORT_ZONE = ZoneId.of("Asia/Kolkata");

    private final SupportTicketRepository supportTicketRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public SupportTicketResponse createTicket(CreateSupportTicketRequest request) {
        User currentUser = currentUserService.getCurrentUser();

        LocalDate today = LocalDate.now(SUPPORT_ZONE);
        Instant startOfDay = today.atStartOfDay(SUPPORT_ZONE).toInstant();
        Instant startOfNextDay = today.plusDays(1).atStartOfDay(SUPPORT_ZONE).toInstant();

        long ticketsToday = supportTicketRepository.countByUser_IdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                currentUser.getId(),
                startOfDay,
                startOfNextDay
        );

        if (ticketsToday >= MAX_TICKETS_PER_DAY) {
            throw new IllegalStateException(
                    "Daily support ticket limit reached (" + MAX_TICKETS_PER_DAY + " tickets per day). Please try again tomorrow."
            );
        }

        SupportTicket ticket = new SupportTicket();
        ticket.setUser(currentUser);
        ticket.setSubject(request.subject().trim());
        ticket.setCategory(request.category());
        ticket.setMessage(request.message().trim());
        ticket.setStatus(TicketStatus.OPEN);

        SupportTicket saved = supportTicketRepository.saveAndFlush(ticket);
        if (saved.getCreatedAt() == null) {
            saved.setCreatedAt(Instant.now());
        }
        if (saved.getUpdatedAt() == null) {
            saved.setUpdatedAt(saved.getCreatedAt());
        }
        return SupportTicketResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<SupportTicketResponse> getMyTickets(PageRequest<SupportTicketFilter> pageRequest) {
        UUID userId = currentUserService.getCurrentUserId();
        SupportTicketFilter filters = pageRequest != null ? pageRequest.filters() : null;
        String search = pageRequest != null ? pageRequest.normalizedSearch() : "";
        Pageable pageable = (pageRequest != null ? pageRequest : new PageRequest<>(0, 10, "createdAt", "DESC", null, null))
                .toPageable(ALLOWED_SORT_FIELDS, "createdAt");

        Specification<SupportTicket> spec = Specification.where(SupportTicketSpecifications.belongsToUser(userId))
                .and(SupportTicketSpecifications.hasStatus(filters != null ? filters.status() : null))
                .and(SupportTicketSpecifications.hasCategory(filters != null ? filters.category() : null))
                .and(SupportTicketSpecifications.matchesSearch(search));

        Page<SupportTicket> pageData = supportTicketRepository.findAll(spec, pageable);
        return PageResponse.from(pageData, SupportTicketResponse::from);
    }

    @Transactional(readOnly = true)
    public SupportTicketResponse getMyTicketById(UUID ticketId) {
        UUID userId = currentUserService.getCurrentUserId();
        SupportTicket ticket = supportTicketRepository.findByIdAndUser_Id(ticketId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Support ticket not found"));
        return SupportTicketResponse.from(ticket);
    }

    @Transactional(readOnly = true)
    public PageResponse<SupportTicketResponse> getAllTicketsForAdmin(PageRequest<SupportTicketFilter> pageRequest) {
        SupportTicketFilter filters = pageRequest != null ? pageRequest.filters() : null;
        String search = pageRequest != null ? pageRequest.normalizedSearch() : "";
        Pageable pageable = (pageRequest != null ? pageRequest : new PageRequest<>(0, 10, "createdAt", "DESC", null, null))
                .toPageable(ALLOWED_SORT_FIELDS, "createdAt");

        Specification<SupportTicket> spec = Specification.where(
                        SupportTicketSpecifications.hasStatus(filters != null ? filters.status() : null)
                )
                .and(SupportTicketSpecifications.hasCategory(filters != null ? filters.category() : null))
                .and(SupportTicketSpecifications.matchesSearch(search));

        Page<SupportTicket> pageData = supportTicketRepository.findAll(spec, pageable);
        return PageResponse.from(pageData, SupportTicketResponse::from);
    }

    @Transactional(readOnly = true)
    public SupportTicketResponse getTicketByIdForAdmin(UUID ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Support ticket not found"));
        return SupportTicketResponse.from(ticket);
    }

    @Transactional
    public SupportTicketResponse resolveTicket(UUID ticketId, ResolveSupportTicketRequest request) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Support ticket not found"));

        User admin = currentUserService.getCurrentUser();

        ticket.setStatus(request.status());
        ticket.setAdminResolution(request.adminResolution().trim());
        ticket.setResolvedBy(admin);

        if (request.status() == TicketStatus.RESOLVED || request.status() == TicketStatus.CLOSED) {
            if (ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(Instant.now());
            }
        } else {
            ticket.setResolvedAt(null);
        }

        SupportTicket saved = supportTicketRepository.save(ticket);
        return SupportTicketResponse.from(saved);
    }
}