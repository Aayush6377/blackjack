package com.aayush.blackjack.auth.dto;

import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Builder;

import java.util.UUID;

@Builder
public record AuthResponse(
        String accessToken,
        @JsonIgnore String rawRefreshToken,
        UserSummary user
) {

    @Builder
    public record UserSummary(
            UUID id,
            String name,
            String email,
            String avatarUrl,
            Role role,
            boolean emailVerified
    ) {}

    public static UserSummary toUserSummary(User user) {
        return UserSummary.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getProfileImageUrl())
                .role(user.getRole())
                .emailVerified(user.getEmailVerified())
                .build();
    }
}
