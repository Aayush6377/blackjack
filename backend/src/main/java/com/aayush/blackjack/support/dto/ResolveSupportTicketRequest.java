package com.aayush.blackjack.support.dto;

import com.aayush.blackjack.support.enums.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResolveSupportTicketRequest(
        @NotNull(message = "Status is required")
        TicketStatus status,

        @NotBlank(message = "Resolution message is required")
        @Size(max = 5000, message = "Resolution must be at most 5000 characters")
        String adminResolution
) {}