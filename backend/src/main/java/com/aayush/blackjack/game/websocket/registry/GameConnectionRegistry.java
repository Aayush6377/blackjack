package com.aayush.blackjack.game.websocket.registry;

import com.aayush.blackjack.game.websocket.dto.SessionBinding;
import com.aayush.blackjack.game.websocket.enums.ConnectionStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Component
public class GameConnectionRegistry {
    public static final Duration DISCONNECT_GRACE_PERIOD = Duration.ofMinutes(2);

    private final Map<String, SessionBinding> sessionsById = new ConcurrentHashMap<>();

    // userId:roundId -> sessionId
    private final Map<String, String> activeControllerByGame = new ConcurrentHashMap<>();

    public void registerSession(String sessionId, UUID userId){
        sessionsById.put(sessionId, SessionBinding.builder()
                .sessionId(sessionId)
                .userId(userId)
                .activeRoundId(null)
                .status(ConnectionStatus.CONNECTED)
                .disconnectedAt(null)
                .graceDeadline(null)
                .build()
        );
    }

    public Optional<String> bindGameController(String sessionId, UUID userId, UUID roundId){
        String gameKey = gameKey(userId, roundId);
        String previousSessionId = activeControllerByGame.put(gameKey, sessionId);

        sessionsById.compute(sessionId, (id, existing) -> SessionBinding.builder()
                .sessionId(sessionId)
                .userId(userId)
                .activeRoundId(roundId)
                .status(ConnectionStatus.CONNECTED)
                .disconnectedAt(null)
                .graceDeadline(null)
                .build()
        );

        if (previousSessionId != null && !previousSessionId.equals(sessionId)) {
            log.debug("Transferred active controller for game [{}] from session [{}] to [{}]",
                    roundId, previousSessionId, sessionId);
            return Optional.of(previousSessionId);
        }

        return Optional.empty();
    }

    public boolean isControllerSession(String sessionId, UUID userId, UUID roundId) {
        String currentController = activeControllerByGame.get(gameKey(userId, roundId));
        return sessionId != null && sessionId.equals(currentController);
    }

    public void markDisconnected(String sessionId){
        SessionBinding binding = sessionsById.get(sessionId);
        if (binding == null){
            return;
        }

        Instant now = Instant.now();
        Instant deadline = now.plus(DISCONNECT_GRACE_PERIOD);

        sessionsById.put(sessionId, SessionBinding.builder()
                .sessionId(binding.sessionId())
                .userId(binding.userId())
                .activeRoundId(binding.activeRoundId())
                .status(ConnectionStatus.DISCONNECTED)
                .disconnectedAt(now)
                .graceDeadline(deadline)
                .build()
        );

        if (binding.activeRoundId() != null) {
            String key = gameKey(binding.userId(), binding.activeRoundId());
            activeControllerByGame.remove(key, sessionId);
        }

        log.info("Session [{}] for user [{}] marked DISCONNECTED; grace deadline at [{}]",
                sessionId, binding.userId(), deadline);
    }

    public void removeSession(String sessionId) {
        SessionBinding binding = sessionsById.remove(sessionId);
        if (binding != null && binding.activeRoundId() != null) {
            activeControllerByGame.remove(gameKey(binding.userId(), binding.activeRoundId()), sessionId);
        }
    }

    public ConnectionStatus getConnectionStatus(String sessionId) {
        SessionBinding binding = sessionsById.get(sessionId);
        return binding != null ? binding.status() : ConnectionStatus.DISCONNECTED;
    }

    public Set<SessionBinding> findExpiredGraceSessions(Instant now) {
        return sessionsById.values().stream()
                .filter(b -> b.status() == ConnectionStatus.DISCONNECTED
                        && b.graceDeadline() != null
                        && now.isAfter(b.graceDeadline()))
                .collect(Collectors.toSet());
    }

    private String gameKey(UUID userId, UUID roundId) {
        return userId + ":" + roundId;
    }
}
