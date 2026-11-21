package com.aayush.blackjack.game.websocket.interceptor;

import com.aayush.blackjack.security.UserPrincipal;
import com.aayush.blackjack.security.jwt.JwtService;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public @Nullable Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null){
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())){
            String token = extractBearerToken(accessor);
            if (token == null){
                throw new IllegalArgumentException("Missing or malformed Bearer token on WebSocket CONNECT");
            }

            try{
                Jwt jwt = jwtService.decodeAndValidate(token);
                UUID userId = UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
                Long claimVersion = jwt.getClaim("tokenVersion");

                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (!Boolean.TRUE.equals(user.getEnabled()) || claimVersion == null
                        || !Objects.equals(user.getTokenVersion().longValue(), claimVersion)) {
                    throw new IllegalArgumentException("User account inactive or token version stale");
                }

                UserPrincipal principal = new UserPrincipal(user);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

                accessor.setUser(auth);
                accessor.getSessionAttributes().put("userId", userId);
                log.debug("Authenticated WebSocket session [{}] for user [{}]", accessor.getSessionId(), userId);

            } catch (JwtException | IllegalArgumentException ex) {
                log.warn("WebSocket authentication rejected: {}", ex.getMessage());
                throw new IllegalArgumentException("Unauthorized WebSocket connection");
            }

        }

        return message;
    }

    private String extractBearerToken(StompHeaderAccessor accessor) {
        List<String> authHeaders = accessor.getNativeHeader(HttpHeaders.AUTHORIZATION);
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String raw = authHeaders.getFirst();
            if (raw != null && raw.startsWith("Bearer ")) {
                return raw.substring(7).trim();
            }
        }
        return null;
    }
}
