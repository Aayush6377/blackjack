
package com.aayush.blackjack.game.engine.settlement;

import com.aayush.blackjack.game.engine.hand.HandEvaluation;
import com.aayush.blackjack.game.engine.rules.RoomRules;

import java.util.Objects;

public final class SettlementEngine {

    private SettlementEngine() {}

    public static SettlementResult calculate(
            HandEvaluation playerEval,
            boolean playerSurrendered,
            HandEvaluation dealerEval,
            long betAmount,
            RoomRules rules,
            boolean insurancePlaced,
            long insuranceBetAmount
    ) {
        Objects.requireNonNull(playerEval, "Player evaluation cannot be null");
        Objects.requireNonNull(dealerEval, "Dealer evaluation cannot be null");
        Objects.requireNonNull(rules, "Room rules cannot be null");

        if (betAmount <= 0) {
            throw new IllegalArgumentException("Bet amount must be positive");
        }

        if (insurancePlaced && insuranceBetAmount <= 0) {
            throw new IllegalArgumentException("Insurance bet must be positive");
        }

        if (!insurancePlaced && insuranceBetAmount != 0) {
            throw new IllegalArgumentException("Insurance amount must be zero when insurance is not placed");
        }

        if (insurancePlaced && insuranceBetAmount > betAmount / 2) {
            throw new IllegalArgumentException("Insurance bet cannot exceed half the original bet");
        }

        boolean insuranceWon = insurancePlaced && dealerEval.blackjack();
        long insurancePayout = insuranceWon ? Math.multiplyExact(insuranceBetAmount, 3L) : 0L;
        long insuranceNetDelta = insurancePayout - insuranceBetAmount;

        // Dealer Blackjack takes precedence over late surrender.
        if (dealerEval.blackjack()) {

            // Both player and dealer have natural Blackjack.
            if (playerEval.blackjack() && !playerSurrendered) {
                return buildResult(
                        HandOutcome.PUSH,
                        betAmount,
                        betAmount,
                        0L,
                        insurancePlaced,
                        insuranceWon,
                        insurancePayout,
                        insuranceNetDelta
                );
            }

            // Dealer Blackjack beats every non-natural player hand.
            return buildResult(
                    HandOutcome.LOSS,
                    betAmount,
                    0L,
                    -betAmount,
                    insurancePlaced,
                    insuranceWon,
                    insurancePayout,
                    insuranceNetDelta
            );
        }

        // Player surrendered after dealer's Blackjack check.
        if (playerSurrendered) {

            long refund = betAmount / 2;

            return buildResult(
                    HandOutcome.SURRENDER,
                    betAmount,
                    refund,
                    refund - betAmount,
                    insurancePlaced,
                    insuranceWon,
                    insurancePayout,
                    insuranceNetDelta
            );
        }

        // Player busted.
        if (playerEval.busted()) {
            return buildResult(
                    HandOutcome.BUST,
                    betAmount,
                    0L,
                    -betAmount,
                    insurancePlaced,
                    insuranceWon,
                    insurancePayout,
                    insuranceNetDelta
            );
        }

        // Natural Blackjack.
        if (playerEval.blackjack()) {

            long profit = calculateBlackjackProfit(betAmount, rules);
            long payout = Math.addExact(betAmount, profit);

            return buildResult(
                    HandOutcome.BLACKJACK_WIN,
                    betAmount,
                    payout,
                    profit,
                    insurancePlaced,
                    insuranceWon,
                    insurancePayout,
                    insuranceNetDelta
            );
        }

        // Dealer busted.
        if (dealerEval.busted()) {

            long payout = Math.multiplyExact(betAmount, 2L);

            return buildResult(
                    HandOutcome.WIN,
                    betAmount,
                    payout,
                    betAmount,
                    insurancePlaced,
                    insuranceWon,
                    insurancePayout,
                    insuranceNetDelta
            );
        }

        int playerTotal = playerEval.total();
        int dealerTotal = dealerEval.total();

        // Compare hand totals.
        if (playerTotal > dealerTotal) {

            long payout = Math.multiplyExact(betAmount, 2L);

            return buildResult(
                    HandOutcome.WIN,
                    betAmount,
                    payout,
                    betAmount,
                    insurancePlaced,
                    insuranceWon,
                    insurancePayout,
                    insuranceNetDelta
            );

        } else if (playerTotal < dealerTotal) {

            return buildResult(
                    HandOutcome.LOSS,
                    betAmount,
                    0L,
                    -betAmount,
                    insurancePlaced,
                    insuranceWon,
                    insurancePayout,
                    insuranceNetDelta
            );

        } else {

            return buildResult(
                    HandOutcome.PUSH,
                    betAmount,
                    betAmount,
                    0L,
                    insurancePlaced,
                    insuranceWon,
                    insurancePayout,
                    insuranceNetDelta
            );
        }
    }

    private static SettlementResult buildResult(
            HandOutcome outcome,
            long betAmount,
            long payoutAmount,
            long mainNetDelta,
            boolean insurancePlaced,
            boolean insuranceWon,
            long insurancePayout,
            long insuranceNetDelta
    ) {

        return SettlementResult.builder()
                .outcome(outcome)
                .betAmount(betAmount)
                .payoutAmount(payoutAmount)
                .netDelta(Math.addExact(mainNetDelta, insuranceNetDelta))
                .insurancePlaced(insurancePlaced)
                .insuranceWon(insuranceWon)
                .insurancePayoutAmount(insurancePayout)
                .build();
    }

    private static long calculateBlackjackProfit(long betAmount, RoomRules rules) {
        String payoutRatio = rules.blackjackPayout();

        if (payoutRatio == null) {
            throw new IllegalArgumentException("Blackjack payout cannot be null");
        }

        String[] ratio = payoutRatio.split(":", -1);

        if (ratio.length != 2) {
            throw new IllegalArgumentException("Invalid blackjack payout ratio");
        }

        try {
            long numerator = Long.parseLong(ratio[0].trim());
            long denominator = Long.parseLong(ratio[1].trim());

            if (numerator <= 0 || denominator <= 0) {
                throw new IllegalArgumentException("Payout ratio values must be positive");
            }

            return Math.multiplyExact(betAmount, numerator) / denominator;

        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid blackjack payout ratio: " + payoutRatio, e);
        }
    }
}
