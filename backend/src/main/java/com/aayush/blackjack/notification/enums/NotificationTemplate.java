package com.aayush.blackjack.notification.enums;

import lombok.Getter;

@Getter
public enum NotificationTemplate {
    VERIFY_EMAIL("email/verify-email", "Verify Your Blackjack Royale Account"),
    RESET_PASSWORD("email/reset-password", "Reset Your Blackjack Royale Password"),
    WELCOME("email/welcome", "Welcome to Blackjack Royale!"),
    PURCHASE_RECEIPT("email/purchase-receipt", "Chip Purchase Confirmation"),
    ADMIN_CHIP_ADJUSTMENT("email/admin-chip-adjustment", "Chips Credited to Your Wallet"),
    DELETE_ACCOUNT("email/delete-account", "Confirm Permanent Account Deletion");

    private final String templatePath;
    private final String defaultSubject;

    NotificationTemplate(String templatePath, String defaultSubject) {
        this.templatePath = templatePath;
        this.defaultSubject = defaultSubject;
    }
}
