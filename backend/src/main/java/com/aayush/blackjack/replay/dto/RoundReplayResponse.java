package com.aayush.blackjack.replay.dto;

import com.aayush.blackjack.game.engine.card.Card;
import com.aayush.blackjack.game.engine.settlement.HandOutcome;
import com.aayush.blackjack.game.enums.HandStatus;
import com.aayush.blackjack.game.entity.GameHand;

import java.util.List;
import java.util.UUID;

public record RoundReplayResponse(
        RoundSummaryResponse round,
        List<HandSnapshot> hands,
        List<ReplayActionItemResponse> actions
) {
    public record HandSnapshot(
            UUID handId,
            Integer handNumber,
            List<Card> cards,
            Long betAmount,
            Integer handValue,
            HandStatus status,
            HandOutcome outcome
    ) {
        public static HandSnapshot from(GameHand hand) {
            return new HandSnapshot(
                    hand.getId(),
                    hand.getHandNumber(),
                    hand.getCards(),
                    hand.getBetAmount(),
                    hand.getHandValue(),
                    hand.getStatus(),
                    hand.getOutcome()
            );
        }
    }
}