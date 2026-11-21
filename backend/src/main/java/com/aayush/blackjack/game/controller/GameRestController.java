package com.aayush.blackjack.game.controller;

import com.aayush.blackjack.game.dto.GameStateSnapshot;
import com.aayush.blackjack.game.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/games")
@RequiredArgsConstructor
public class GameRestController {
    private final GameService gameService;

    @GetMapping("/active")
    public ResponseEntity<GameStateSnapshot> getActiveGame() {
        return gameService.getActiveGameSnapshot()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/{gameId}/leave")
    public ResponseEntity<?> leaveGame(@PathVariable UUID gameId) {
        GameStateSnapshot finalState = gameService.leaveGame(gameId);
        return ResponseEntity.ok(Map.of(
                "message", "Left game successfully",
                "gameState", finalState
        ));
    }

}
