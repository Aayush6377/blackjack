package com.aayush.blackjack.room.dto;

import lombok.Builder;

@Builder
public record RoomRulesDto(
        Long minWallet,
        Long minBet,
        Long maxBet,
        Integer decksPerShoe,
        Double reshuffleThreshold,
        String blackjackPayout,
        Boolean dealerHitsSoft17
) {}
