package com.aayush.blackjack.replay.dto;

import com.aayush.blackjack.game.engine.card.Card;
import com.aayush.blackjack.game.engine.settlement.HandOutcome;
import com.aayush.blackjack.game.entity.GameAction;
import com.aayush.blackjack.game.enums.GameActionType;
import com.aayush.blackjack.game.enums.HandStatus;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record ReplayActionItemResponse(
        UUID actionId,
        Integer sequenceNumber,
        GameActionType actionType,
        Map<String, Object> actionData,
        UUID handId,
        Integer handNumber,
        List<Card> handCards,
        Long handBetAmount,
        Integer handValue,
        HandStatus handStatus,
        HandOutcome handOutcome,
        Instant createdAt
) {
    public static ReplayActionItemResponse from(GameAction action) {
        var hand = action.getGameHand();
        return new ReplayActionItemResponse(
                action.getId(),
                action.getSequenceNumber(),
                action.getActionType(),
                action.getActionData(),
                hand != null ? hand.getId() : null,
                hand != null ? hand.getHandNumber() : null,
                hand != null ? hand.getCards() : List.of(),
                hand != null ? hand.getBetAmount() : null,
                hand != null ? hand.getHandValue() : null,
                hand != null ? hand.getStatus() : null,
                hand != null ? hand.getOutcome() : null,
                action.getCreatedAt()
        );
    }
}