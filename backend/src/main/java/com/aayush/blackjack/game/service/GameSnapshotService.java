package com.aayush.blackjack.game.service;

import com.aayush.blackjack.game.dto.GameStateSnapshot;
import com.aayush.blackjack.game.entity.GameHand;
import com.aayush.blackjack.game.entity.GameRound;
import com.aayush.blackjack.game.enums.InsuranceStatus;
import com.aayush.blackjack.game.enums.RoundStatus;
import com.aayush.blackjack.game.repository.GameHandRepository;
import com.aayush.blackjack.game.websocket.enums.ConnectionStatus;
import com.aayush.blackjack.game.websocket.registry.GameConnectionRegistry;
import com.aayush.blackjack.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GameSnapshotService {
    private final GameConnectionRegistry connectionRegistry;
    private final GameHandRepository gameHandRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final WalletService walletService;

    public void bindControllerAndNotify(String sessionId, UUID userId, UUID roundId) {
        if (sessionId != null) {
            connectionRegistry.bindGameController(sessionId, userId, roundId)
                    .ifPresent(oldSessionId -> notifyControllerTransferred(userId, roundId, oldSessionId));
        }
    }

    public void ensureControllerTab(String sessionId, UUID userId, UUID roundId) {
        if (sessionId != null && !connectionRegistry.isControllerSession(sessionId, userId, roundId)) {
            connectionRegistry.bindGameController(sessionId, userId, roundId)
                    .ifPresent(oldSessionId -> notifyControllerTransferred(userId, roundId, oldSessionId));
        }
    }

    public void sendStateToUser(UUID userId, GameStateSnapshot snapshot) {
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/game.state",
                snapshot
        );
    }

    public GameStateSnapshot buildSnapshot(
            GameRound round,
            UUID userId,
            String sessionId,
            ConnectionStatus fallbackStatus
    ) {
        List<GameHand> hands = gameHandRepository.findAllByGameRoundOrderByHandNumberAsc(round);

        List<GameStateSnapshot.HandSnapshot> handSnapshots = hands.stream()
                .map(GameStateSnapshot.HandSnapshot::from)
                .toList();

        boolean insuranceAvailable = round.getStatus() == RoundStatus.IN_PROGRESS
                && round.getInsuranceStatus() == InsuranceStatus.NONE
                && !round.getDealerCards().isEmpty()
                && round.getDealerCards().getFirst().isAce();

        ConnectionStatus connStatus = sessionId != null ? connectionRegistry.getConnectionStatus(sessionId) : fallbackStatus;
        boolean isController = sessionId == null || connectionRegistry.isControllerSession(sessionId, userId, round.getId());
        long walletBalance = walletService.getBalance(userId);

        return GameStateSnapshot.builder()
                .roundId(round.getId())
                .roomId(round.getRoom().getId())
                .roomName(round.getRoom().getName())
                .roundStatus(round.getStatus())
                .connectionStatus(connStatus)
                .controllerTab(isController)
                .walletBalance(walletBalance)
                .originalBet(round.getOriginalBet())
                .totalBet(round.getTotalBet())
                .totalPayout(round.getTotalPayout())
                .netResult(round.getNetResult())
                .dealerCards(List.copyOf(round.getDealerCards()))
                .dealerTotal(round.getDealerTotal())
                .insuranceAvailable(insuranceAvailable)
                .insuranceBet(round.getInsuranceBet())
                .insuranceStatus(round.getInsuranceStatus())
                .insurancePayout(round.getInsurancePayout())
                .roundOutcome(round.getOutcome())
                .hands(handSnapshots)
                .build();
    }

    private void notifyControllerTransferred(UUID userId, UUID roundId, String oldSessionId) {
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/game.events",
                Map.of(
                        "type", "CONTROLLER_TRANSFERRED",
                        "roundId", roundId.toString(),
                        "sessionId", oldSessionId,
                        "message", "This game is now controlled from another browser tab."
                )
        );
    }
}