package com.aayush.blackjack.notification.dto;

import com.aayush.blackjack.notification.enums.NotificationTemplate;
import lombok.Builder;

import java.util.Collections;
import java.util.Map;
import java.util.Objects;

@Builder
public record NotificationRequest(
        String recipient,
        String subject,
        NotificationTemplate template,
        Map<String, Object> variables
) {
    public NotificationRequest {
        Objects.requireNonNull(recipient, "Recipient must not be null");
        Objects.requireNonNull(template, "NotificationTemplate must not be null");
        subject = (subject == null || subject.isBlank()) ? template.getDefaultSubject() : subject;
        variables = (variables == null) ? Collections.emptyMap() : Map.copyOf(variables);
    }

    public NotificationRequest(String recipient, NotificationTemplate template, Map<String, Object> variables) {
        this(recipient, template.getDefaultSubject(), template, variables);
    }
}
