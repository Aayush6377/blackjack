package com.aayush.blackjack.auth.repository;

import com.aayush.blackjack.auth.entity.RefreshToken;
import com.aayush.blackjack.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String rawToken);

    void deleteAllByUser(User user);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.id = :id")
    int deleteByIdReturningCount(@Param("id") UUID id);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.tokenHash = :tokenHash")
    int deleteByTokenHash(@Param("tokenHash") String tokenHash);
}
