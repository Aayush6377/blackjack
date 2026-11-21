package com.aayush.blackjack.game.controller;

import com.aayush.blackjack.game.dto.GameActionCommand;
import com.aayush.blackjack.game.dto.GameStateSnapshot;
import com.aayush.blackjack.game.dto.InsuranceCommand;
import com.aayush.blackjack.game.dto.StartRoundRequest;
import com.aayush.blackjack.game.service.GameService;
import com.aayush.blackjack.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class GameWebSocketController {
    private final GameService gameService;

    @MessageMapping("/game.subscribe")
    @SendToUser("/queue/game.state")
    public GameStateSnapshot subscribeAndSync(
            UUID roundId,
            Principal principal,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        UUID userId = extractUserId(principal);
        return gameService.attachSessionToRound(userId, roundId, headerAccessor.getSessionId());
    }

    @MessageMapping("/game.start")
    @SendToUser("/queue/game.state")
    public GameStateSnapshot startRound(
            @Valid StartRoundRequest request,
            Principal principal,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        UUID userId = extractUserId(principal);
        return gameService.startRound(userId, request, headerAccessor.getSessionId());
    }

    @MessageMapping("/game.insurance")
    @SendToUser("/queue/game.state")
    public GameStateSnapshot handleInsurance(
            @Valid InsuranceCommand command,
            Principal principal,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        UUID userId = extractUserId(principal);
        return gameService.decideInsurance(userId, command, headerAccessor.getSessionId());
    }

    @MessageMapping("/game.action")
    @SendToUser("/queue/game.state")
    public GameStateSnapshot executePlayerAction(
            @Valid GameActionCommand command,
            Principal principal,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        UUID userId = extractUserId(principal);
        return gameService.executePlayerAction(userId, command, headerAccessor.getSessionId());
    }

    @MessageExceptionHandler
    @SendToUser("/queue/game.errors")
    public Map<String, String> handleError(Exception ex) {
        return Map.of(
                "error", ex.getClass().getSimpleName(),
                "message", ex.getMessage() != null ? ex.getMessage() : "Game action failed"
        );
    }

    private UUID extractUserId(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth
                && auth.getPrincipal() instanceof UserPrincipal userPrincipal) {
            return userPrincipal.getId();
        }

        throw new IllegalStateException("Authenticated WebSocket principal missing");
    }
}
