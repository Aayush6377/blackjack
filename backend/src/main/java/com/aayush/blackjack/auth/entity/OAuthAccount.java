package com.aayush.blackjack.auth.entity;

import com.aayush.blackjack.auth.enums.AuthProvider;
import com.aayush.blackjack.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "oauth_accounts", uniqueConstraints = {
        @UniqueConstraint(name = "uk_provider_user", columnNames = {"provider", "provider_user_id"})
}, indexes = {
        @Index(name = "idx_oauth_provider_user", columnList = "provider, provider_user_id")
})
@Getter
@Setter
@NoArgsConstructor
public class OAuthAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider;

    @Column(nullable = false)
    private String providerUserId;

    @Column(nullable = false)
    private String email;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
