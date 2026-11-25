package com.aayush.blackjack.support.controller;

import com.aayush.blackjack.common.dto.PageRequest;
import com.aayush.blackjack.common.dto.PageResponse;
import com.aayush.blackjack.support.dto.ResolveSupportTicketRequest;
import com.aayush.blackjack.support.dto.SupportTicketFilter;
import com.aayush.blackjack.support.dto.SupportTicketResponse;
import com.aayush.blackjack.support.service.SupportTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/support/tickets")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSupportTicketController {

    private final SupportTicketService supportTicketService;

    @PostMapping("/search")
    public ResponseEntity<PageResponse<SupportTicketResponse>> searchTickets(
            @RequestBody(required = false) PageRequest<SupportTicketFilter> pageRequest
    ) {
        return ResponseEntity.ok(supportTicketService.getAllTicketsForAdmin(pageRequest));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<SupportTicketResponse> getTicketById(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(supportTicketService.getTicketByIdForAdmin(ticketId));
    }

    @PatchMapping("/{ticketId}/resolve")
    public ResponseEntity<SupportTicketResponse> resolveTicket(
            @PathVariable UUID ticketId,
            @Valid @RequestBody ResolveSupportTicketRequest request
    ) {
        return ResponseEntity.ok(supportTicketService.resolveTicket(ticketId, request));
    }
}