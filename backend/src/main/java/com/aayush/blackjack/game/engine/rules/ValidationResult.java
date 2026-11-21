package com.aayush.blackjack.game.engine.rules;

public record ValidationResult(
        boolean valid,
        String message
) {
    public static ValidationResult validResult() {
        return new ValidationResult(true, null);
    }

    public static ValidationResult invalid(String message) {
        return new ValidationResult(false, message);
    }
}
