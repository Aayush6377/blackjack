package com.aayush.blackjack.game.engine.card;

import lombok.Getter;

@Getter
public enum Suit {
    HEARTS("H"),
    DIAMONDS("D"),
    CLUBS("C"),
    SPADES("S");

    private final String shortCode;

    Suit(String shortCode) {
        this.shortCode = shortCode;
    }

    public static Suit fromShortCode(String code) {
        for (Suit suit : values()) {
            if (suit.shortCode.equalsIgnoreCase(code)) {
                return suit;
            }
        }
        throw new IllegalArgumentException("Unknown suit code: " + code);
    }
}
