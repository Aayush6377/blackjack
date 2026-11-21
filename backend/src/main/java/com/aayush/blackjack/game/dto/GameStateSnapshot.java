package com.aayush.blackjack.game.dto;

import com.aayush.blackjack.game.engine.card.Card;
import com.aayush.blackjack.game.engine.settlement.HandOutcome;
import com.aayush.blackjack.game.entity.GameHand;
import com.aayush.blackjack.game.enums.HandStatus;
import com.aayush.blackjack.game.enums.InsuranceStatus;
import com.aayush.blackjack.game.enums.RoundStatus;
import com.aayush.blackjack.game.websocket.enums.ConnectionStatus;
import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record GameStateSnapshot(
        UUID roundId,
        UUID roomId,
        String roomName,
        RoundStatus roundStatus,
        ConnectionStatus connectionStatus,
        long walletBalance,
        boolean controllerTab,
        long originalBet,
        long totalBet,
        long totalPayout,
        long netResult,
        List<Card> dealerCards,
        int dealerTotal,
        boolean insuranceAvailable,
        long insuranceBet,
        InsuranceStatus insuranceStatus,
        long insurancePayout,
        HandOutcome roundOutcome,
        List<HandSnapshot> hands
) {

    @Builder
    public record HandSnapshot(
            UUID handId,
            int handNumber,
            List<Card> cards,
            long betAmount,
            int handValue,
            HandStatus status,
            HandOutcome outcome
    ) {
        public static HandSnapshot from(GameHand gameHand) {
            return HandSnapshot.builder()
                    .handId(gameHand.getId())
                    .handNumber(gameHand.getHandNumber())
                    .cards(gameHand.getCards())
                    .betAmount(gameHand.getBetAmount())
                    .handValue(gameHand.getHandValue())
                    .status(gameHand.getStatus())
                    .outcome(gameHand.getOutcome())
                    .build();
        }
    }
}
