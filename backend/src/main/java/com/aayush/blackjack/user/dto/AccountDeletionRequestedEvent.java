package com.aayush.blackjack.user.dto;

import java.util.UUID;

public record AccountDeletionRequestedEvent(
        UUID userId,
        String email,
        String profileImagePublicId
) { }