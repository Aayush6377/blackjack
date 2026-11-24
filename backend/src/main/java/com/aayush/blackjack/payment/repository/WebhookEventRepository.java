package com.aayush.blackjack.payment.repository;

import com.aayush.blackjack.payment.entity.WebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WebhookEventRepository extends JpaRepository<WebhookEvent, UUID> {
    boolean existsByEventId(String eventId);
}
