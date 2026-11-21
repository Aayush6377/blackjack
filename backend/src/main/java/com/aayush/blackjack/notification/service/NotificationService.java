package com.aayush.blackjack.notification.service;

import com.aayush.blackjack.notification.dto.NotificationRequest;

public interface NotificationService {
    void sendNotification(NotificationRequest request);
}
