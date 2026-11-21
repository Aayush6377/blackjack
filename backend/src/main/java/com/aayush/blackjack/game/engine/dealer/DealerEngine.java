package com.aayush.blackjack.game.engine.dealer;

import com.aayush.blackjack.game.engine.card.Card;
import com.aayush.blackjack.game.engine.hand.HandEvaluation;
import com.aayush.blackjack.game.engine.hand.HandEvaluator;
import com.aayush.blackjack.game.engine.rules.RoomRules;
import com.aayush.blackjack.game.engine.shoe.Shoe;

import java.util.List;

public final class DealerEngine {
    private DealerEngine(){}

    public static void playTurn(List<Card> dealerCards, Shoe shoe, RoomRules rules) {
        while (true){
            HandEvaluation eval = HandEvaluator.evaluate(dealerCards);

            if (eval.total() > 17){
                break;
            }

            if (eval.total() == 17 && !eval.soft()){
                break;
            }

            if (eval.total() == 17){
                if (!rules.dealerHitsSoft17()){
                    break;
                }
            }

            dealerCards.add(shoe.draw());
        }
    }
}
