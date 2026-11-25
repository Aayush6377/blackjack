package com.aayush.blackjack.support.dto;

import com.aayush.blackjack.support.enums.TicketCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateSupportTicketRequest(
        @NotBlank(message = "Subject is required")
        @Size(max = 160, message = "Subject must be at most 160 characters")
        String subject,

        @NotNull(message = "Category is required")
        TicketCategory category,

        @NotBlank(message = "Message is required")
        @Size(max = 5000, message = "Message must be at most 5000 characters")
        String message
) {}