package com.aayush.blackjack.game.engine.deck;

import com.aayush.blackjack.game.engine.card.Card;
import com.aayush.blackjack.game.engine.card.Rank;
import com.aayush.blackjack.game.engine.card.Suit;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class Deck {
    private static final List<Card> STANDARD_52;

    static {
        List<Card> cards = new ArrayList<>(52);

        for (Suit suit: Suit.values()){
            for (Rank rank: Rank.values()){
                cards.add(new Card(rank, suit));
            }
        }

        STANDARD_52 = Collections.unmodifiableList(cards);
    }

    private Deck() {}

    public static List<Card> createStandard52() {
        return new ArrayList<>(STANDARD_52);
    }
}
