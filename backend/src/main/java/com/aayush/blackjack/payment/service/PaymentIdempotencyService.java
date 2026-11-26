package com.aayush.blackjack.payment.service;

import com.aayush.blackjack.payment.dto.PaymentVerificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentIdempotencyService {

    private static final Duration IDEMPOTENCY_TTL = Duration.ofMinutes(15);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public String buildVerifyKey(UUID userId, String orderId, String paymentId) {
        return "idempotency:payment:verify:" + userId + ":" + orderId.trim() + ":" + paymentId.trim();
    }

    public Optional<PaymentVerificationResponse> getCached(String key) {
        String raw = redisTemplate.opsForValue().get(key);
        if (raw == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(raw, PaymentVerificationResponse.class));
        } catch (JacksonException e) {
            log.warn("Failed to deserialize idempotent payment response from Redis key [{}]", key, e);
            return Optional.empty();
        }
    }

    public void cache(String key, PaymentVerificationResponse response) {
        try {
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(key, json, IDEMPOTENCY_TTL);
        } catch (JacksonException e) {
            log.warn("Failed to cache idempotent payment response to Redis key [{}]", key, e);
        }
    }
}