package com.aayush.blackjack.game.engine.settlement;

import lombok.Builder;

@Builder
public record SettlementResult(
        HandOutcome outcome,
        long betAmount,
        long payoutAmount,
        long netDelta,

        boolean insurancePlaced,
        boolean insuranceWon,
        long insurancePayoutAmount
) { }
