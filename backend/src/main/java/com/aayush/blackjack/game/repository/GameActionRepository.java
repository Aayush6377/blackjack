package com.aayush.blackjack.game.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.aayush.blackjack.game.entity.GameAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GameActionRepository extends JpaRepository<GameAction, UUID> {

    Optional<GameAction> findTopByGameRound_IdOrderBySequenceNumberDesc(UUID gameRoundId);
}
