package com.aayush.blackjack.auth.repository;

import com.aayush.blackjack.auth.entity.OAuthAccount;
import com.aayush.blackjack.auth.enums.AuthProvider;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OAuthAccountRepository extends JpaRepository<OAuthAccount, UUID> {
    @EntityGraph(attributePaths = {"user"})
    Optional<OAuthAccount> findByProviderAndProviderUserId(AuthProvider provider, String providerUserId);
}
