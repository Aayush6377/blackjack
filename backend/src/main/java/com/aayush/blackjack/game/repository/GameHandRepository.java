package com.aayush.blackjack.game.repository;

import com.aayush.blackjack.game.entity.GameHand;
import com.aayush.blackjack.game.entity.GameRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface GameHandRepository extends JpaRepository<GameHand, UUID> {
    List<GameHand> findAllByGameRoundOrderByHandNumberAsc(GameRound round);

    @Modifying
    @Query("DELETE FROM GameHand h WHERE h.gameRound.id IN :roundIds")
    void deleteAllByRoundIds(@Param("roundIds") List<UUID> roundIds);
}
