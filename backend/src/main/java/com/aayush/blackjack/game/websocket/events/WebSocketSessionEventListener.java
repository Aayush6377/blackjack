package com.aayush.blackjack.game.websocket.events;

import com.aayush.blackjack.game.websocket.dto.SessionBinding;
import com.aayush.blackjack.game.websocket.registry.GameConnectionRegistry;
import com.aayush.blackjack.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketSessionEventListener {
    private final GameConnectionRegistry connectionRegistry;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void onSessionConnected(SessionConnectEvent event){
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Authentication auth = (Authentication) accessor.getUser();

        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            connectionRegistry.registerSession(accessor.getSessionId(), principal.getId());
        }
    }

    @EventListener
    public void onSessionDisconnected(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        connectionRegistry.markDisconnected(sessionId);
    }

    @Scheduled(fixedDelay = 30000L)
    public void sweepExpiredGracePeriods() {
        Instant now = Instant.now();
        for (SessionBinding expired : connectionRegistry.findExpiredGraceSessions(now)) {
            log.debug("Grace period expired for session [{}], user [{}], round [{}]", expired.sessionId(), expired.userId(), expired.activeRoundId());

            if (expired.activeRoundId() != null) {
                messagingTemplate.convertAndSendToUser(
                        expired.userId().toString(),
                        "/queue/game.events",
                        Map.of(
                                "type", "GRACE_PERIOD_EXPIRED",
                                "roundId", expired.activeRoundId().toString(),
                                "message", "Reconnect grace period expired."
                        )
                );
            }

            connectionRegistry.removeSession(expired.sessionId());
        }
    }
}
