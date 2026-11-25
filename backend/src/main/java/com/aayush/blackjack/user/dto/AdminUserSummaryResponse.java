package com.aayush.blackjack.user.dto;

import com.aayush.blackjack.user.entity.User;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record AdminUserSummaryResponse(
        UUID id,
        String name,
        String email,
        String profileImageUrl,
        boolean enabled,
        boolean emailVerified,
        long walletBalance,
        Instant createdAt
) {
    public static AdminUserSummaryResponse from(User user, long walletBalance) {
        return AdminUserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .enabled(Boolean.TRUE.equals(user.getEnabled()))
                .emailVerified(Boolean.TRUE.equals(user.getEmailVerified()))
                .walletBalance(walletBalance)
                .createdAt(user.getCreatedAt())
                .build();
    }
}