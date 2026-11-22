package com.aayush.blackjack.game.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.aayush.blackjack.game.entity.GameAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GameActionRepository extends JpaRepository<GameAction, UUID> {

    Optional<GameAction> findTopByGameRound_IdOrderBySequenceNumberDesc(UUID gameRoundId);

    List<GameAction> findAllByGameRound_IdOrderBySequenceNumberAsc(UUID roundId);

    @Modifying
    @Query("DELETE FROM GameAction a WHERE a.gameRound.id IN :roundIds")
    void deleteAllByRoundIds(@Param("roundIds") List<UUID> roundIds);
}
