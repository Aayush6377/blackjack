package com.aayush.blackjack.game.service;

import com.aayush.blackjack.game.dto.GameActionCommand;
import com.aayush.blackjack.game.dto.GameStateSnapshot;
import com.aayush.blackjack.game.dto.InsuranceCommand;
import com.aayush.blackjack.game.dto.StartRoundRequest;
import com.aayush.blackjack.game.engine.BlackjackEngineFacade;
import com.aayush.blackjack.game.engine.hand.HandEvaluator;
import com.aayush.blackjack.game.engine.rules.PlayerActionType;
import com.aayush.blackjack.game.engine.rules.RoomRules;
import com.aayush.blackjack.game.engine.shoe.Shoe;
import com.aayush.blackjack.game.entity.GameAction;
import com.aayush.blackjack.game.entity.GameHand;
import com.aayush.blackjack.game.entity.GameRound;
import com.aayush.blackjack.game.entity.GameShoe;
import com.aayush.blackjack.game.enums.GameActionType;
import com.aayush.blackjack.game.enums.HandStatus;
import com.aayush.blackjack.game.enums.InsuranceStatus;
import com.aayush.blackjack.game.enums.RoundStatus;
import com.aayush.blackjack.game.repository.GameActionRepository;
import com.aayush.blackjack.game.repository.GameHandRepository;
import com.aayush.blackjack.game.repository.GameRoundRepository;
import com.aayush.blackjack.game.websocket.enums.ConnectionStatus;
import com.aayush.blackjack.room.entity.GameRoom;
import com.aayush.blackjack.room.repository.GameRoomRepository;
import com.aayush.blackjack.security.service.CurrentUserService;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.repository.UserRepository;
import com.aayush.blackjack.wallet.entity.ChipWallet;
import com.aayush.blackjack.wallet.repository.ChipWalletRepository;
import com.aayush.blackjack.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GameService {
    private final GameRoundRepository gameRoundRepository;
    private final GameHandRepository gameHandRepository;
    private final GameActionRepository gameActionRepository;
    private final GameRoomRepository gameRoomRepository;
    private final UserRepository userRepository;
    private final ChipWalletRepository chipWalletRepository;

    private final CurrentUserService currentUserService;
    private final ActionIdempotencyService idempotencyService;
    private final GameShoeService shoeService;
    private final GameSnapshotService snapshotService;
    private final RoundSettlementService settlementService;
    private final WalletService walletService;

    @Transactional(readOnly = true)
    public Optional<GameStateSnapshot> getActiveGameSnapshot() {
        UUID userId = currentUserService.getCurrentUserId();
        return gameRoundRepository.findFirstByUser_IdAndStatusInOrderByStartedAtDesc(
                        userId, List.of(RoundStatus.WAITING, RoundStatus.IN_PROGRESS)
                )
                .map(round -> snapshotService.buildSnapshot(round, userId, null, ConnectionStatus.CONNECTED));
    }

    @Transactional
    public GameStateSnapshot attachSessionToRound(UUID userId, UUID roundId, String sessionId) {
        GameRound round = loadOwnedRound(userId, roundId);
        snapshotService.bindControllerAndNotify(sessionId, userId, roundId);
        return snapshotService.buildSnapshot(round, userId, sessionId, ConnectionStatus.CONNECTED);
    }

    @Transactional
    public GameStateSnapshot startRound(UUID userId, StartRoundRequest request, String sessionId) {
        String idempotencyKey = "idempotency:start:" + userId + ":" + request.idempotencyKey();
        Optional<GameStateSnapshot> cached = idempotencyService.getCached(idempotencyKey);
        if (cached.isPresent()) {
            return cached.get();
        }

        gameRoundRepository.findFirstByUser_IdAndStatusInOrderByStartedAtDesc(userId, List.of(RoundStatus.WAITING, RoundStatus.IN_PROGRESS))
                .ifPresent(existing -> {
                    throw new IllegalStateException("You already have an active round in progress in " + existing.getRoom().getName());
                });

        GameRoom room = gameRoomRepository.findById(request.roomId())
                .orElseThrow(() -> new IllegalArgumentException("Game room not found"));

        if (!Boolean.TRUE.equals(room.getActive())) {
            throw new IllegalStateException("Game room is currently inactive");
        }
        if (request.betAmount() < room.getMinBet() || request.betAmount() > room.getMaxBet()) {
            throw new IllegalArgumentException("Bet must be between " + room.getMinBet() + " and " + room.getMaxBet());
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User Not Found"));
        long currentBalance = fetchWalletBalance(userId);
        if (currentBalance < room.getMinWallet() || currentBalance < request.betAmount()) {
            throw new IllegalArgumentException("Insufficient wallet balance for this room/bet");
        }

        GameShoe shoeEntity = shoeService.lockOrCreateActiveShoe(user, room);
        Shoe engineShoe = shoeService.toEngineShoe(shoeEntity);
        boolean reshuffled = engineShoe.needsReshuffle(room.getReshuffleThreshold());
        if (reshuffled) {
            engineShoe.reshuffle();
        }

        BlackjackEngineFacade.InitialDealResult deal = BlackjackEngineFacade.dealInitialRound(engineShoe);
        shoeService.syncAndSave(shoeEntity, engineShoe, reshuffled);

        boolean dealerShowsAce = !deal.dealerCards().isEmpty() && deal.dealerCards().getFirst().isAce();
        boolean immediateRoundOver = !dealerShowsAce && (deal.playerEvaluation().blackjack() || deal.dealerEvaluation().blackjack());

        GameRound round = new GameRound();
        round.setUser(user);
        round.setRoom(room);
        round.setGameShoe(shoeEntity);
        round.setOriginalBet(request.betAmount());
        round.setTotalBet(request.betAmount());
        round.setDealerCards(new ArrayList<>(deal.dealerCards()));
        round.setDealerTotal(deal.dealerEvaluation().total());
        round.setRulesSnapshot(snapshotRules(room));
        round.setStatus(immediateRoundOver ? RoundStatus.COMPLETED : RoundStatus.IN_PROGRESS);
        round = gameRoundRepository.save(round);

        walletService.debitBet(userId, request.betAmount(), round, idempotencyKey);

        GameHand hand = new GameHand();
        hand.setGameRound(round);
        hand.setHandNumber(1);
        hand.setCards(new ArrayList<>(deal.playerCards()));
        hand.setBetAmount(request.betAmount());
        hand.setHandValue(deal.playerEvaluation().total());
        hand.setStatus(deal.playerEvaluation().blackjack() ? HandStatus.BLACKJACK : HandStatus.ACTIVE);
        gameHandRepository.save(hand);

        recordAction(round, hand, GameActionType.ROUND_STARTED, Map.of(
                "betAmount", request.betAmount(),
                "idempotencyKey", request.idempotencyKey()
        ));

        if (immediateRoundOver) {
            settlementService.settleRound(round, List.of(hand), engineShoe, toRoomRules(room));
        }

        snapshotService.bindControllerAndNotify(sessionId, userId, round.getId());

        GameStateSnapshot snapshot = snapshotService.buildSnapshot(round, userId, sessionId, ConnectionStatus.CONNECTED);
        idempotencyService.cache(idempotencyKey, snapshot);
        return snapshot;
    }

    @Transactional
    public GameStateSnapshot decideInsurance(UUID userId, InsuranceCommand command, String sessionId) {
        snapshotService.ensureControllerTab(sessionId, userId, command.roundId());

        GameRound round = loadOwnedRound(userId, command.roundId());

        String idempotencyKey = "idempotency:insurance:" + command.roundId() + ":" + command.idempotencyKey();
        Optional<GameStateSnapshot> cached = idempotencyService.getCached(idempotencyKey);
        if (cached.isPresent()) {
            return cached.get();
        }

        if (round.getStatus() != RoundStatus.IN_PROGRESS) {
            throw new IllegalStateException("Round is not in progress");
        }
        if (round.getInsuranceStatus() != InsuranceStatus.NONE) {
            throw new IllegalStateException("Insurance decision already recorded");
        }

        boolean insuranceAvailable = !round.getDealerCards().isEmpty() && round.getDealerCards().getFirst().isAce();
        long balance = fetchWalletBalance(userId);

        if (command.accept()) {
            BlackjackEngineFacade.InsuranceExecutionResult ins = BlackjackEngineFacade.placeInsurance(
                    round.getOriginalBet(), balance, insuranceAvailable, false
            );

            walletService.debitInsurance(userId, ins.insuranceBetAmount(), round, idempotencyKey);
            round.setInsuranceBet(ins.insuranceBetAmount());
            round.setTotalBet(round.getTotalBet() + ins.insuranceBetAmount());
            round.setInsuranceStatus(InsuranceStatus.ACCEPTED);
        } else {
            round.setInsuranceBet(0L);
            round.setInsuranceStatus(InsuranceStatus.DECLINED);
        }

        gameRoundRepository.save(round);

        GameActionType insuranceActionType = command.accept() ? GameActionType.INSURANCE_ACCEPTED : GameActionType.INSURANCE_DECLINED;
        recordAction(round, null, insuranceActionType, Map.of(
                "accepted", command.accept(),
                "insuranceBet", round.getInsuranceBet(),
                "idempotencyKey", command.idempotencyKey()
        ));

        var dealerEval = HandEvaluator.evaluate(round.getDealerCards());
        List<GameHand> playerHands = gameHandRepository.findAllByGameRoundOrderByHandNumberAsc(round);
        boolean playerHasBlackjack = playerHands.stream().anyMatch(h -> h.getStatus() == HandStatus.BLACKJACK);

        if (dealerEval.blackjack() || playerHasBlackjack) {
            GameShoe shoeEntity = shoeService.lockActiveShoe(userId, round.getRoom().getId());
            Shoe engineShoe = shoeService.toEngineShoe(shoeEntity);
            settlementService.settleRound(round, playerHands, engineShoe, toRoomRules(round.getRoom()));
            shoeService.syncAndSave(shoeEntity, engineShoe, false);
        }

        GameStateSnapshot snapshot = snapshotService.buildSnapshot(round, userId, sessionId, ConnectionStatus.CONNECTED);
        idempotencyService.cache(idempotencyKey, snapshot);
        return snapshot;
    }

    @Transactional
    public GameStateSnapshot executePlayerAction(UUID userId, GameActionCommand command, String sessionId) {
        snapshotService.ensureControllerTab(sessionId, userId, command.roundId());

        GameRound round = loadOwnedRound(userId, command.roundId());

        String idempotencyKey = "idempotency:action:" + command.roundId() + ":" + command.idempotencyKey();
        Optional<GameStateSnapshot> cached = idempotencyService.getCached(idempotencyKey);
        if (cached.isPresent()) {
            return cached.get();
        }

        if (round.getStatus() != RoundStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot execute action when round status is " + round.getStatus());
        }

        GameShoe shoeEntity = shoeService.lockActiveShoe(userId, round.getRoom().getId());
        Shoe engineShoe = shoeService.toEngineShoe(shoeEntity);

        List<GameHand> allHands = gameHandRepository.findAllByGameRoundOrderByHandNumberAsc(round);
        GameHand targetHand = resolveTargetHand(allHands, command.handId());

        GameActionType recordedActionType = mapToGameActionType(command.action());
        long balance = fetchWalletBalance(userId);
        boolean isFirstHandOfRound = targetHand.getHandNumber() == 1 && targetHand.getCards().size() == 2;

        BlackjackEngineFacade.ActionExecutionResult result = BlackjackEngineFacade.executeAction(
                command.action(),
                targetHand.getCards(),
                targetHand.getBetAmount(),
                balance,
                allHands.size(),
                isFirstHandOfRound,
                engineShoe
        );

        shoeService.syncAndSave(shoeEntity, engineShoe, false);

        if (result.additionalBetRequired() > 0) {
            walletService.debitAdditionalBet(userId, result.additionalBetRequired(), round, idempotencyKey);
            round.setTotalBet(round.getTotalBet() + result.additionalBetRequired());

            if (command.action() == PlayerActionType.DOUBLE_DOWN) {
                targetHand.setBetAmount(targetHand.getBetAmount() + result.additionalBetRequired());
            }
        }

        targetHand.setCards(new ArrayList<>(result.updatedHandCards()));
        targetHand.setHandValue(result.evaluation().total());

        if (command.action() == PlayerActionType.SURRENDER) {
            targetHand.setStatus(HandStatus.SURRENDERED);
        } else if (result.evaluation().busted()) {
            targetHand.setStatus(HandStatus.BUSTED);
        } else if (result.handEnded() || result.evaluation().isTwentyOne()) {
            targetHand.setStatus(HandStatus.STOOD);
        }
        gameHandRepository.save(targetHand);

        if (result.spawnedHandCards() != null) {
            var spawnedEval = HandEvaluator.evaluate(result.spawnedHandCards(), true);
            GameHand splitHand = new GameHand();
            splitHand.setGameRound(round);
            splitHand.setHandNumber(allHands.size() + 1);
            splitHand.setCards(new ArrayList<>(result.spawnedHandCards()));
            splitHand.setBetAmount(targetHand.getBetAmount());
            splitHand.setHandValue(spawnedEval.total());
            if (spawnedEval.busted()) {
                splitHand.setStatus(HandStatus.BUSTED);
            } else if (spawnedEval.isTwentyOne()) {
                splitHand.setStatus(HandStatus.STOOD);
            } else {
                splitHand.setStatus(HandStatus.ACTIVE);
            }
            allHands.add(gameHandRepository.save(splitHand));
        }

        recordAction(round, targetHand, recordedActionType, Map.of(
                "handId", targetHand.getId().toString(),
                "handValue", targetHand.getHandValue(),
                "idempotencyKey", command.idempotencyKey()
        ));

        boolean anyHandStillActive = allHands.stream().anyMatch(h -> h.getStatus() == HandStatus.ACTIVE);
        if (!anyHandStillActive) {
            settlementService.settleRound(round, allHands, engineShoe, toRoomRules(round.getRoom()));
        } else {
            gameRoundRepository.save(round);
        }

        GameStateSnapshot snapshot = snapshotService.buildSnapshot(round, userId, sessionId, ConnectionStatus.CONNECTED);
        idempotencyService.cache(idempotencyKey, snapshot);
        return snapshot;
    }

    @Transactional
    public GameStateSnapshot leaveGame(UUID gameId) {
        UUID userId = currentUserService.getCurrentUserId();
        GameRound round = loadOwnedRound(userId, gameId);

        if (round.getStatus() == RoundStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot leave while a round has an active unresolved bet. Finish or settle the round first.");
        }

        if (round.getStatus() == RoundStatus.WAITING) {
            round.setStatus(RoundStatus.CANCELLED);
            round.setCompletedAt(Instant.now());
            gameRoundRepository.save(round);
        }
        else if (round.getStatus() != RoundStatus.COMPLETED && round.getStatus() != RoundStatus.ABANDONED) {
            round.setStatus(RoundStatus.COMPLETED);
            round.setCompletedAt(Instant.now());
            gameRoundRepository.save(round);
        }

        GameStateSnapshot snapshot = snapshotService.buildSnapshot(round, userId, null, ConnectionStatus.DISCONNECTED);
        snapshotService.sendStateToUser(userId, snapshot);
        return snapshot;
    }

    private GameRound loadOwnedRound(UUID userId, UUID roundId) {
        GameRound round = gameRoundRepository.findLockedById(roundId).orElseThrow(() ->
                new IllegalArgumentException("Game round not found"));

        if (!round.getUser().getId().equals(userId)) {
            throw new SecurityException("You do not own this game round");
        }

        return round;
    }

    private GameHand resolveTargetHand(List<GameHand> hands, UUID handId) {
        if (handId != null) {
            return hands.stream()
                    .filter(h -> h.getId().equals(handId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Hand not found in round"));
        }
        return hands.stream()
                .filter(h -> h.getStatus() == HandStatus.ACTIVE)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No active hand available"));
    }

    private GameActionType mapToGameActionType(PlayerActionType actionType) {
        return switch (actionType) {
            case HIT -> GameActionType.PLAYER_HIT;
            case STAND -> GameActionType.PLAYER_STAND;
            case DOUBLE_DOWN -> GameActionType.PLAYER_DOUBLE_DOWN;
            case SPLIT -> GameActionType.PLAYER_SPLIT;
            case SURRENDER -> GameActionType.PLAYER_SURRENDERED;
        };
    }

    private void recordAction(GameRound round, GameHand hand, GameActionType type, Map<String, Object> data) {
        int nextSeq = gameActionRepository.findTopByGameRound_IdOrderBySequenceNumberDesc(round.getId())
                .map(a -> a.getSequenceNumber() + 1)
                .orElse(1);

        GameAction action = new GameAction();
        action.setGameRound(round);
        action.setGameHand(hand);
        action.setSequenceNumber(nextSeq);
        action.setActionType(type);
        action.setActionData(new HashMap<>(data));
        gameActionRepository.save(action);
    }

    private RoomRules toRoomRules(GameRoom room) {
        return RoomRules.builder()
                .decksPerShoe(room.getDecksPerShoe())
                .reshuffleThreshold(room.getReshuffleThreshold())
                .blackjackPayout(room.getBlackjackPayout())
                .dealerHitsSoft17(Boolean.TRUE.equals(room.getDealerHitsSoft17()))
                .minBet(room.getMinBet())
                .maxBet(room.getMaxBet())
                .build();
    }

    private Map<String, Object> snapshotRules(GameRoom room) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("decksPerShoe", room.getDecksPerShoe());
        map.put("reshuffleThreshold", room.getReshuffleThreshold());
        map.put("blackjackPayout", room.getBlackjackPayout());
        map.put("dealerHitsSoft17", room.getDealerHitsSoft17());
        map.put("minBet", room.getMinBet());
        map.put("maxBet", room.getMaxBet());
        return map;
    }

    private long fetchWalletBalance(UUID userId) {
        return chipWalletRepository.findByUser_Id(userId)
                .map(ChipWallet::getBalance)
                .orElse(0L);
    }
}