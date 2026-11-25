package com.aayush.blackjack.user.dto;

import com.aayush.blackjack.user.entity.User;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record UserProfileResponse(
        UUID id,
        String name,
        String email,
        String profileImageUrl,
        String profileImagePublicId,
        String role,
        boolean emailVerified,
        boolean enabled,
        Instant createdAt,
        Instant updatedAt
) {
    public static UserProfileResponse from(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .profileImagePublicId(user.getProfileImagePublicId())
                .role(user.getRole().name())
                .emailVerified(Boolean.TRUE.equals(user.getEmailVerified()))
                .enabled(Boolean.TRUE.equals(user.getEnabled()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}