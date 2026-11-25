package com.aayush.blackjack.support.dto;

import com.aayush.blackjack.support.enums.TicketCategory;
import com.aayush.blackjack.support.enums.TicketStatus;

public record SupportTicketFilter(
        TicketStatus status,
        TicketCategory category
) {}