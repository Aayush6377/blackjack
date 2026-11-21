package com.aayush.blackjack.game.engine.rules;

import com.aayush.blackjack.game.engine.card.Card;
import com.aayush.blackjack.game.engine.hand.HandEvaluation;
import com.aayush.blackjack.game.engine.hand.HandEvaluator;

import java.util.List;

public final class ActionValidator {

    private ActionValidator() {}

    public static ValidationResult validate(
            PlayerActionType action,
            List<Card> handCards,
            boolean handActive,
            long handBet,
            long playerWalletBalance,
            int currentHandCount,
            boolean isFirstHandOfRound
    ) {
        if (!handActive) {
            return ValidationResult.invalid("Hand is no longer active.");
        }

        HandEvaluation eval = HandEvaluator.evaluate(handCards);
        if (eval.busted() || eval.isTwentyOne()) {
            return ValidationResult.invalid("Cannot act on a busted or 21 hand.");
        }

        return switch (action) {
            case HIT, STAND -> ValidationResult.validResult();

            case DOUBLE_DOWN -> {
                if (handCards.size() != 2) {
                    yield ValidationResult.invalid("Double down is only permitted on initial 2 cards.");
                }
                if (playerWalletBalance < handBet) {
                    yield ValidationResult.invalid("Insufficient wallet balance to double down.");
                }
                yield ValidationResult.validResult();
            }

            case SPLIT -> {
                if (handCards.size() != 2) {
                    yield ValidationResult.invalid("Split is only permitted on initial 2 cards.");
                }
                if (handCards.get(0).getValue() != handCards.get(1).getValue()) {
                    yield ValidationResult.invalid("Can only split cards of equal rank or value.");
                }
                if (currentHandCount >= 4) {
                    yield ValidationResult.invalid("Maximum split hands limit reached.");
                }
                if (playerWalletBalance < handBet) {
                    yield ValidationResult.invalid("Insufficient wallet balance to split.");
                }
                yield ValidationResult.validResult();
            }

            case SURRENDER -> {
                if (!isFirstHandOfRound || handCards.size() != 2) {
                    yield ValidationResult.invalid("Late surrender is only available on the initial 2 cards before any action.");
                }
                yield ValidationResult.validResult();
            }
        };
    }
}