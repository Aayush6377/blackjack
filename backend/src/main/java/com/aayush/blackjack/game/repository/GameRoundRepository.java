package com.aayush.blackjack.game.repository;

import com.aayush.blackjack.game.entity.GameRound;
import com.aayush.blackjack.game.enums.RoundStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GameRoundRepository extends JpaRepository<GameRound, UUID> {

    Optional<GameRound> findFirstByUser_IdAndStatusInOrderByStartedAtDesc(UUID userId, List<RoundStatus> waiting);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT r FROM GameRound r
    WHERE r.id = :roundId
    """)
    Optional<GameRound> findLockedById(@Param("roundId") UUID roundId);
}
