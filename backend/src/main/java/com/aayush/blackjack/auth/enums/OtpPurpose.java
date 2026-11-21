package com.aayush.blackjack.auth.enums;

import com.aayush.blackjack.notification.enums.NotificationTemplate;
import lombok.Getter;

@Getter
public enum OtpPurpose {
    EMAIL_VERIFICATION("blackjack:otp:verify:", NotificationTemplate.VERIFY_EMAIL),
    PASSWORD_RESET("blackjack:otp:reset:", NotificationTemplate.RESET_PASSWORD);

    private final String redisPrefix;
    private final NotificationTemplate template;

    OtpPurpose(String redisPrefix, NotificationTemplate template) {
        this.redisPrefix = redisPrefix;
        this.template = template;
    }
}
