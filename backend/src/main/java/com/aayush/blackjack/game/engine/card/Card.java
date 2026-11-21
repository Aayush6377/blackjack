package com.aayush.blackjack.game.engine.card;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Builder;

import java.util.Objects;

@Builder
public record Card(
    Rank rank,
    Suit suit
) {
    public Card {
        Objects.requireNonNull(rank, "Rank must not be null");
        Objects.requireNonNull(suit, "Suit must not be null");
    }

    public int getValue() {
        return rank.getValue();
    }

    public boolean isAce() {
        return rank == Rank.ACE;
    }

    @JsonValue
    public String toCode() {
        return rank.getShortCode() + suit.getShortCode();
    }

    @JsonCreator
    public static Card fromCode(String code){
        if (code == null || code.length() < 2 || code.length() > 3) {
            throw new IllegalArgumentException("Invalid card code: " + code);
        }
        String suitPart = code.substring(code.length() - 1);
        String rankPart = code.substring(0, code.length() - 1);
        return new Card(Rank.fromShortCode(rankPart), Suit.fromShortCode(suitPart));
    }
}
