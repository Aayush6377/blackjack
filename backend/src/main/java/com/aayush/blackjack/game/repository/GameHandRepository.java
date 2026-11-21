package com.aayush.blackjack.game.repository;

import com.aayush.blackjack.game.entity.GameHand;
import com.aayush.blackjack.game.entity.GameRound;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GameHandRepository extends JpaRepository<GameHand, UUID> {
    List<GameHand> findAllByGameRoundOrderByHandNumberAsc(GameRound round);
}
