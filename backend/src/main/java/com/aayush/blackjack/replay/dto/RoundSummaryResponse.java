package com.aayush.blackjack.replay.dto;

import com.aayush.blackjack.game.engine.card.Card;
import com.aayush.blackjack.game.engine.settlement.HandOutcome;
import com.aayush.blackjack.game.enums.InsuranceStatus;
import com.aayush.blackjack.game.enums.RoundStatus;
import com.aayush.blackjack.game.entity.GameRound;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record RoundSummaryResponse(
        UUID roundId,
        UUID roomId,
        String roomName,
        Long originalBet,
        Long totalBet,
        Long totalPayout,
        Long netResult,
        RoundStatus status,
        HandOutcome outcome,
        List<Card> dealerCards,
        Integer dealerTotal,
        Long insuranceBet,
        InsuranceStatus insuranceStatus,
        Long insurancePayout,
        Map<String, Object> rulesSnapshot,
        Instant startedAt,
        Instant completedAt
) {
    public static RoundSummaryResponse from(GameRound round) {
        return new RoundSummaryResponse(
                round.getId(),
                round.getRoom().getId(),
                round.getRoom().getName(),
                round.getOriginalBet(),
                round.getTotalBet(),
                round.getTotalPayout(),
                round.getNetResult(),
                round.getStatus(),
                round.getOutcome(),
                round.getDealerCards(),
                round.getDealerTotal(),
                round.getInsuranceBet(),
                round.getInsuranceStatus(),
                round.getInsurancePayout(),
                round.getRulesSnapshot(),
                round.getStartedAt(),
                round.getCompletedAt()
        );
    }
}