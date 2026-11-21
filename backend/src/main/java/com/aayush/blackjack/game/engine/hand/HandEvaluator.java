package com.aayush.blackjack.game.engine.hand;

import com.aayush.blackjack.game.engine.card.Card;

import java.util.List;

public final class HandEvaluator {
    private HandEvaluator() {}

    public static HandEvaluation evaluate(List<Card> cards) {
        return evaluate(cards, false);
    }

    public static HandEvaluation evaluate(List<Card> cards, boolean fromSplit){
        if (cards == null || cards.isEmpty()) {
            return new HandEvaluation(0, false, false, false);
        }

        int total = 0;
        int softAces = 0;

        for (Card card: cards){
            total += card.getValue();
            if (card.isAce()){
                softAces++;
            }
        }

        while (total > 21 && softAces > 0){
            total -= 10;
            softAces--;
        }

        boolean isSoft = softAces > 0;
        boolean isBusted = total > 21;
        boolean isBlackjack = !fromSplit && cards.size() == 2 && total == 21;

        return new HandEvaluation(total, isSoft, isBlackjack, isBusted);
    }
}
