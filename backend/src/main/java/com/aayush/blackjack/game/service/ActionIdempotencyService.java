package com.aayush.blackjack.game.service;

import com.aayush.blackjack.game.dto.GameStateSnapshot;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActionIdempotencyService {
    private static final Duration IDEMPOTENCY_TTL = Duration.ofHours(24);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public Optional<GameStateSnapshot> getCached(String key) {
        String raw = redisTemplate.opsForValue().get(key);
        if (raw == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(raw, GameStateSnapshot.class));
        } catch (JacksonException e) {
            log.warn("Failed to deserialize idempotent snapshot from Redis key [{}]", key, e);
            return Optional.empty();
        }
    }

    public void cache(String key, GameStateSnapshot snapshot) {
        try {
            String json = objectMapper.writeValueAsString(snapshot);
            redisTemplate.opsForValue().set(key, json, IDEMPOTENCY_TTL);
        } catch (JacksonException e) {
            log.warn("Failed to cache idempotent snapshot to Redis key [{}]", key, e);
        }
    }
}
