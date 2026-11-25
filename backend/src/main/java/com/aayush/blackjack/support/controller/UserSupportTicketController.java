package com.aayush.blackjack.support.controller;

import com.aayush.blackjack.common.dto.PageRequest;
import com.aayush.blackjack.common.dto.PageResponse;
import com.aayush.blackjack.support.dto.CreateSupportTicketRequest;
import com.aayush.blackjack.support.dto.SupportTicketFilter;
import com.aayush.blackjack.support.dto.SupportTicketResponse;
import com.aayush.blackjack.support.service.SupportTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/support/tickets")
@RequiredArgsConstructor
public class UserSupportTicketController {

    private final SupportTicketService supportTicketService;

    @PostMapping
    public ResponseEntity<SupportTicketResponse> createTicket(@Valid @RequestBody CreateSupportTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supportTicketService.createTicket(request));
    }

    @PostMapping("/me/search")
    public ResponseEntity<PageResponse<SupportTicketResponse>> searchMyTickets(
            @RequestBody(required = false) PageRequest<SupportTicketFilter> pageRequest
    ) {
        return ResponseEntity.ok(supportTicketService.getMyTickets(pageRequest));
    }

    @GetMapping("/me/{ticketId}")
    public ResponseEntity<SupportTicketResponse> getMyTicketById(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(supportTicketService.getMyTicketById(ticketId));
    }
}