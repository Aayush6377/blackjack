package com.aayush.blackjack.game.engine.shoe;

import com.aayush.blackjack.game.engine.card.Card;
import com.aayush.blackjack.game.engine.deck.Deck;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Getter
public class Shoe {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final int deckCount;
    private final List<Card> cards;
    private int cursor;

    @JsonCreator
    public Shoe(
            @JsonProperty("deckCount") int deckCount,
            @JsonProperty("cards") List<Card> cards,
            @JsonProperty("cursor") int cursor
    ) {
        if (deckCount < 1 || deckCount > 8) {
            throw new IllegalArgumentException("Deck count must be between 1 and 8");
        }
        this.deckCount = deckCount;
        this.cards = new ArrayList<>(cards);
        this.cursor = cursor;
    }

    public static Shoe createShuffled(int deckCount){
        List<Card> allCards = new ArrayList<>(52 * deckCount);
        for (int i = 0; i < deckCount; i++){
            allCards.addAll(Deck.createStandard52());
        }

        Collections.shuffle(allCards, SECURE_RANDOM);
        return new Shoe(deckCount, allCards, 0);
    }

    public Card draw(){
        if (cursor >= cards.size()) {
            reshuffle();
        }

        return cards.get(cursor++);
    }

    public void reshuffle() {
        Collections.shuffle(cards, SECURE_RANDOM);
        cursor = 0;
    }

    @JsonIgnore
    public int getTotalCards() {
        return cards.size();
    }

    @JsonIgnore
    public int getRemainingCards() {
        return Math.max(0, cards.size() - cursor);
    }

    @JsonIgnore
    public double getPenetrationRatio() {
        if (cards.isEmpty()) return 1.0;
        return (double) cursor / cards.size();
    }

    public boolean needsReshuffle(double reshuffleThreshold) {
        return getPenetrationRatio() >= reshuffleThreshold || getRemainingCards() < 15;
    }
}
