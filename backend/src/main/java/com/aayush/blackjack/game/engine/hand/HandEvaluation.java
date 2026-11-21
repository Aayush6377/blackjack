package com.aayush.blackjack.game.engine.hand;

public record HandEvaluation(
        int total,
        boolean soft,
        boolean blackjack,
        boolean busted
) {
    public boolean isTwentyOne() {
        return total == 21;
    }
}
