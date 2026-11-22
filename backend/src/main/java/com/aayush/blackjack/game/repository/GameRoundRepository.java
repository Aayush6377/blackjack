package com.aayush.blackjack.game.repository;

import com.aayush.blackjack.game.entity.GameRound;
import com.aayush.blackjack.game.enums.RoundStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
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

    Page<GameRound> findAllByUser_Id(UUID userId, Pageable pageable);

    @Query("""
        select r from GameRound r
        where r.user.id = :userId
          and (
            :search = ''
            or lower(r.room.name) like lower(concat('%', :search, '%'))
            or lower(cast(r.status as string)) like lower(concat('%', :search, '%'))
            or lower(coalesce(cast(r.outcome as string), '')) like lower(concat('%', :search, '%'))
          )
        """)
    Page<GameRound> searchUserRounds(
            @Param("userId") UUID userId,
            @Param("search") String search,
            Pageable pageable
    );

    Optional<GameRound> findByIdAndUser_Id(UUID roundId, UUID userId);

    @Query(value = """
        SELECT id FROM game_rounds
        WHERE user_id = :userId
          AND status IN ('COMPLETED', 'CANCELLED', 'ABANDONED')
        ORDER BY started_at DESC
        OFFSET :maxRecords
        """, nativeQuery = true)
    List<UUID> findOverflowRoundIds(@Param("userId") UUID userId, @Param("maxRecords") int maxRecords);

    @Modifying
    @Query("DELETE FROM GameRound r WHERE r.id IN :roundIds")
    void deleteAllByIdIn(@Param("roundIds") List<UUID> roundIds);
}
