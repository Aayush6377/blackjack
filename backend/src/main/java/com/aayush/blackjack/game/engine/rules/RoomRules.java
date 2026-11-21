package com.aayush.blackjack.game.engine.rules;

import lombok.Builder;

@Builder
public record RoomRules(
        int decksPerShoe,
        double reshuffleThreshold,
        String blackjackPayout,
        boolean dealerHitsSoft17,
        long minBet,
        long maxBet
) { }
