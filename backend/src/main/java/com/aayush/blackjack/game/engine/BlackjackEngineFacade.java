package com.aayush.blackjack.game.engine;

import com.aayush.blackjack.game.engine.card.Card;
import com.aayush.blackjack.game.engine.dealer.DealerEngine;
import com.aayush.blackjack.game.engine.hand.HandEvaluation;
import com.aayush.blackjack.game.engine.hand.HandEvaluator;
import com.aayush.blackjack.game.engine.rules.ActionValidator;
import com.aayush.blackjack.game.engine.rules.PlayerActionType;
import com.aayush.blackjack.game.engine.rules.RoomRules;
import com.aayush.blackjack.game.engine.rules.ValidationResult;
import com.aayush.blackjack.game.engine.settlement.SettlementEngine;
import com.aayush.blackjack.game.engine.settlement.SettlementResult;
import com.aayush.blackjack.game.engine.shoe.Shoe;

import java.util.ArrayList;
import java.util.List;

public final class BlackjackEngineFacade {

    private BlackjackEngineFacade() {}

    public record InitialDealResult(
            List<Card> playerCards,
            List<Card> dealerCards,
            HandEvaluation playerEvaluation,
            HandEvaluation dealerEvaluation,
            boolean roundOver,
            boolean insuranceAvailable
    ) {}

    public static InitialDealResult dealInitialRound(Shoe shoe) {
        List<Card> playerCards = new ArrayList<>();
        List<Card> dealerCards = new ArrayList<>();

        playerCards.add(shoe.draw());
        dealerCards.add(shoe.draw()); // Face-up card
        playerCards.add(shoe.draw());
        dealerCards.add(shoe.draw()); // Hole card

        HandEvaluation playerEval = HandEvaluator.evaluate(playerCards);
        HandEvaluation dealerEval = HandEvaluator.evaluate(dealerCards);

        boolean insuranceAvailable = dealerCards.getFirst().isAce();
        boolean roundOver = playerEval.blackjack() || dealerEval.blackjack();

        return new InitialDealResult(playerCards, dealerCards, playerEval, dealerEval, roundOver, insuranceAvailable);
    }

    public record ActionExecutionResult(
            List<Card> updatedHandCards,
            List<Card> spawnedHandCards,
            HandEvaluation evaluation,
            boolean handEnded,
            long additionalBetRequired
    ) {}

    public static ActionExecutionResult executeAction(
            PlayerActionType action,
            List<Card> handCards,
            long handBet,
            long playerWalletBalance,
            int currentHandCount,
            boolean isFirstHandOfRound,
            Shoe shoe
    ) {
        // Validate move
        ValidationResult validation = ActionValidator.validate(
                action, handCards, true, handBet, playerWalletBalance, currentHandCount, isFirstHandOfRound
        );

        if (!validation.valid()) {
            throw new IllegalArgumentException(validation.message());
        }

        List<Card> updatedCards = new ArrayList<>(handCards);
        List<Card> spawnedCards = null;
        boolean handEnded = false;
        long additionalBetRequired = 0L;

        switch (action) {
            case HIT -> {
                updatedCards.add(shoe.draw());
                HandEvaluation eval = HandEvaluator.evaluate(updatedCards);
                if (eval.busted() || eval.isTwentyOne()) {
                    handEnded = true;
                }
            }
            case STAND, SURRENDER -> {
                handEnded = true;
            }
            case DOUBLE_DOWN -> {
                updatedCards.add(shoe.draw());
                additionalBetRequired = handBet;
                handEnded = true;
            }
            case SPLIT -> {
                spawnedCards = new ArrayList<>();
                spawnedCards.add(updatedCards.remove(1));

                updatedCards.add(shoe.draw());
                spawnedCards.add(shoe.draw());

                additionalBetRequired = handBet;

                HandEvaluation splitHandEval = HandEvaluator.evaluate(updatedCards, true);
                if (splitHandEval.isTwentyOne() || splitHandEval.busted()) {
                    handEnded = true;
                }
            }
        }

        HandEvaluation finalEval = HandEvaluator.evaluate(updatedCards);
        return new ActionExecutionResult(updatedCards, spawnedCards, finalEval, handEnded, additionalBetRequired);
    }

    public record RoundSettlementResult(
            List<Card> finalDealerCards,
            HandEvaluation dealerEvaluation,
            List<SettlementResult> handSettlements
    ) {}

    public record PlayerHandSnapshot(
            HandEvaluation evaluation,
            boolean surrendered,
            boolean busted,
            boolean blackjack,
            long betAmount,
            boolean insurancePlaced,
            long insuranceBetAmount
    ) {}

    public static RoundSettlementResult settleRound(
            List<Card> dealerCards,
            List<PlayerHandSnapshot> playerHands,
            Shoe shoe,
            RoomRules rules
    ) {
        List<Card> mutableDealerCards = new ArrayList<>(dealerCards);

        boolean allPlayersFinished = playerHands.stream()
                .allMatch(h -> h.busted() || h.surrendered() || h.blackjack());

        if (!allPlayersFinished) {
            DealerEngine.playTurn(mutableDealerCards, shoe, rules);
        }

        HandEvaluation dealerEval = HandEvaluator.evaluate(mutableDealerCards);
        List<SettlementResult> settlements = new ArrayList<>();

        for (PlayerHandSnapshot hand : playerHands) {
            SettlementResult result = SettlementEngine.calculate(
                    hand.evaluation(),
                    hand.surrendered(),
                    dealerEval,
                    hand.betAmount(),
                    rules,
                    hand.insurancePlaced(),
                    hand.insuranceBetAmount()
            );
            settlements.add(result);
        }

        return new RoundSettlementResult(mutableDealerCards, dealerEval, settlements);
    }

    public record InsuranceExecutionResult(
            long insuranceBetAmount
    ) {}

    public static InsuranceExecutionResult placeInsurance(
            long originalBet,
            long playerWalletBalance,
            boolean insuranceAvailable,
            boolean alreadyActed
    ) {
        if (!insuranceAvailable) {
            throw new IllegalStateException("Insurance is not available because the dealer's upcard is not an Ace.");
        }
        if (alreadyActed) {
            throw new IllegalStateException("Insurance can only be placed before taking any hand actions.");
        }

        long insuranceBet = originalBet / 2;
        if (playerWalletBalance < insuranceBet) {
            throw new IllegalArgumentException("Insufficient wallet balance for insurance bet.");
        }

        return new InsuranceExecutionResult(insuranceBet);
    }
}