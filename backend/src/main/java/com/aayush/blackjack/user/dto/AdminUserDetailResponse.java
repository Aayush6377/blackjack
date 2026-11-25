package com.aayush.blackjack.user.dto;

import com.aayush.blackjack.user.entity.User;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record AdminUserDetailResponse(
        UUID id,
        String name,
        String email,
        String profileImageUrl,
        String profileImagePublicId,
        String role,
        boolean enabled,
        boolean emailVerified,
        UUID walletId,
        long walletBalance,
        long totalPurchases,
        long totalPaidInPaise,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminUserDetailResponse from(
            User user,
            UUID walletId,
            long walletBalance,
            long totalPurchases,
            long totalPaidInPaise
    ) {
        return AdminUserDetailResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .profileImagePublicId(user.getProfileImagePublicId())
                .role(user.getRole().name())
                .enabled(Boolean.TRUE.equals(user.getEnabled()))
                .emailVerified(Boolean.TRUE.equals(user.getEmailVerified()))
                .walletId(walletId)
                .walletBalance(walletBalance)
                .totalPurchases(totalPurchases)
                .totalPaidInPaise(totalPaidInPaise)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}