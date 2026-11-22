package com.aayush.blackjack.game.service;

import com.aayush.blackjack.game.repository.GameActionRepository;
import com.aayush.blackjack.game.repository.GameHandRepository;
import com.aayush.blackjack.game.repository.GameRoundRepository;
import com.aayush.blackjack.wallet.repository.ChipTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoundRetentionService {
    private static final int MAX_REPLAY_ROUNDS_PER_USER = 50;

    private final GameRoundRepository gameRoundRepository;
    private final GameHandRepository gameHandRepository;
    private final GameActionRepository gameActionRepository;
    private final ChipTransactionRepository chipTransactionRepository;

    @Transactional
    public void pruneOldRoundsForUser(UUID userId) {
        List<UUID> overflowIds = gameRoundRepository.findOverflowRoundIds(
                userId,
                MAX_REPLAY_ROUNDS_PER_USER
        );

        if (overflowIds.isEmpty()) {
            return;
        }

        chipTransactionRepository.clearGameRoundByRoundIds(overflowIds);
        gameActionRepository.deleteAllByRoundIds(overflowIds);
        gameHandRepository.deleteAllByRoundIds(overflowIds);
        gameRoundRepository.deleteAllByIdIn(overflowIds);
    }
}
