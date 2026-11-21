package com.aayush.blackjack.game.engine.card;

import lombok.Getter;

@Getter
public enum Rank {
    TWO(2, "2"),
    THREE(3, "3"),
    FOUR(4, "4"),
    FIVE(5, "5"),
    SIX(6, "6"),
    SEVEN(7, "7"),
    EIGHT(8, "8"),
    NINE(9, "9"),
    TEN(10, "10"),
    JACK(10, "J"),
    QUEEN(10, "Q"),
    KING(10, "K"),
    ACE(11, "A"); // HandEvaluator dynamically downgrades 11 -> 1 if total > 21

    private final int value;
    private final String shortCode;

    Rank(int value, String shortCode) {
        this.value = value;
        this.shortCode = shortCode;
    }

    public static Rank fromShortCode(String code) {
        for (Rank rank : values()) {
            if (rank.shortCode.equalsIgnoreCase(code)) {
                return rank;
            }
        }
        throw new IllegalArgumentException("Unknown rank code: " + code);
    }
}
