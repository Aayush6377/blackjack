package com.aayush.blackjack.game.service;

import com.aayush.blackjack.game.engine.BlackjackEngineFacade;
import com.aayush.blackjack.game.engine.hand.HandEvaluation;
import com.aayush.blackjack.game.engine.hand.HandEvaluator;
import com.aayush.blackjack.game.engine.rules.RoomRules;
import com.aayush.blackjack.game.engine.settlement.HandOutcome;
import com.aayush.blackjack.game.engine.settlement.SettlementResult;
import com.aayush.blackjack.game.engine.shoe.Shoe;
import com.aayush.blackjack.game.entity.GameHand;
import com.aayush.blackjack.game.entity.GameRound;
import com.aayush.blackjack.game.enums.HandStatus;
import com.aayush.blackjack.game.enums.InsuranceStatus;
import com.aayush.blackjack.game.enums.RoundStatus;
import com.aayush.blackjack.game.repository.GameHandRepository;
import com.aayush.blackjack.game.repository.GameRoundRepository;
import com.aayush.blackjack.room.entity.GameRoom;
import com.aayush.blackjack.room.entity.RoomProgress;
import com.aayush.blackjack.room.entity.RoomUnlockRule;
import com.aayush.blackjack.room.repository.RoomProgressRepository;
import com.aayush.blackjack.room.repository.RoomUnlockRuleRepository;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.wallet.entity.ChipWallet;
import com.aayush.blackjack.wallet.enums.TransactionType;
import com.aayush.blackjack.wallet.repository.ChipWalletRepository;
import com.aayush.blackjack.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoundSettlementService {
    private final GameRoundRepository gameRoundRepository;
    private final GameHandRepository gameHandRepository;
    private final RoomProgressRepository roomProgressRepository;
    private final RoomUnlockRuleRepository roomUnlockRuleRepository;
    private final ChipWalletRepository chipWalletRepository;
    private final WalletService walletService;
    private final RoundRetentionService roundRetentionService;

    public void settleRound(
            GameRound round,
            List<GameHand> hands,
            Shoe engineShoe,
            RoomRules rules
    ) {
        boolean insurancePlaced = round.getInsuranceStatus() == InsuranceStatus.ACCEPTED && round.getInsuranceBet() > 0;
        long insuranceBetPerHand = insurancePlaced ? round.getInsuranceBet() : 0L;

        List<BlackjackEngineFacade.PlayerHandSnapshot> snapshots = hands.stream()
                .map(h -> {
                    boolean isFromSplit = Boolean.TRUE.equals(h.getFromSplit());
                    HandEvaluation eval = HandEvaluator.evaluate(h.getCards(), isFromSplit);
                    boolean isNaturalBlackjack = !isFromSplit && h.getStatus() == HandStatus.BLACKJACK;

                    return new BlackjackEngineFacade.PlayerHandSnapshot(
                            eval,
                            h.getStatus() == HandStatus.SURRENDERED,
                            h.getStatus() == HandStatus.BUSTED,
                            isNaturalBlackjack,
                            h.getBetAmount(),
                            insurancePlaced,
                            insuranceBetPerHand
                    );
                })
                .toList();

        BlackjackEngineFacade.RoundSettlementResult settlement = BlackjackEngineFacade.settleRound(
                round.getDealerCards(), snapshots, engineShoe, rules
        );

        round.setDealerCards(new ArrayList<>(settlement.finalDealerCards()));
        round.setDealerTotal(settlement.dealerEvaluation().total());

        long totalPayout = 0L;
        long totalNet = 0L;
        long insurancePayoutTotal = 0L;
        boolean anyInsuranceWon = false;

        for (int i = 0; i < hands.size(); i++) {
            GameHand hand = hands.get(i);
            SettlementResult res = settlement.handSettlements().get(i);
            hand.setOutcome(res.outcome());
            hand.setStatus(HandStatus.SETTLED);
            gameHandRepository.save(hand);

            totalPayout += res.payoutAmount() + res.insurancePayoutAmount();
            totalNet += res.netDelta();
            insurancePayoutTotal += res.insurancePayoutAmount();
            if (res.insuranceWon()) {
                anyInsuranceWon = true;
            }
        }

        if (insurancePlaced) {
            round.setInsurancePayout(insurancePayoutTotal);
            round.setInsuranceStatus(anyInsuranceWon ? InsuranceStatus.WON : InsuranceStatus.LOST);
        }

        round.setTotalPayout(totalPayout);
        round.setNetResult(totalNet);
        round.setOutcome(settlement.handSettlements().getFirst().outcome());
        round.setStatus(RoundStatus.COMPLETED);
        round.setCompletedAt(Instant.now());
        gameRoundRepository.save(round);

        UUID playerId = round.getUser().getId();
        if (totalPayout > 0) {
            boolean isOnlyPush = settlement.handSettlements().stream()
                    .allMatch(r -> r.outcome() == HandOutcome.PUSH) && !anyInsuranceWon;
            boolean isOnlySurrender = settlement.handSettlements().stream()
                    .allMatch(r -> r.outcome() == HandOutcome.SURRENDER) && !anyInsuranceWon;

            TransactionType payoutType = isOnlyPush
                    ? TransactionType.PUSH_REFUND
                    : (isOnlySurrender ? TransactionType.SURRENDER_REFUND : TransactionType.WIN_PAYOUT);

            walletService.creditSettlement(
                    playerId,
                    totalPayout,
                    payoutType,
                    round,
                    "final"
            );
        }

        boolean roundWon = totalNet > 0;
        updateRoomProgressAndUnlocks(round.getUser(), round.getRoom(), roundWon);
        roundRetentionService.pruneOldRoundsForUser(round.getUser().getId());
    }

    private void updateRoomProgressAndUnlocks(User user, GameRoom room, boolean roundWon) {
        Instant now = Instant.now();

        RoomProgress currentProgress = roomProgressRepository.findByUser_IdAndRoom_Id(user.getId(), room.getId())
                .orElseGet(() -> {
                    RoomProgress created = new RoomProgress();
                    created.setUser(user);
                    created.setRoom(room);
                    created.setRoundsPlayed(0);
                    created.setRoundsWon(0);
                    created.setUnlocked(true);
                    created.setUnlockedAt(now);
                    return created;
                });

        if (!Boolean.TRUE.equals(currentProgress.getUnlocked())) {
            currentProgress.setUnlocked(true);
            currentProgress.setUnlockedAt(now);
        }
        currentProgress.setRoundsPlayed(currentProgress.getRoundsPlayed() + 1);
        if (roundWon) {
            currentProgress.setRoundsWon(currentProgress.getRoundsWon() + 1);
        }
        roomProgressRepository.save(currentProgress);

        Map<UUID, RoomProgress> progressByRoomId = roomProgressRepository.findAllByUser_Id(user.getId())
                .stream()
                .collect(Collectors.toMap(rp -> rp.getRoom().getId(), Function.identity(), (a, b) -> a));

        long walletBalance = chipWalletRepository.findByUser_Id(user.getId())
                .map(ChipWallet::getBalance)
                .orElse(0L);

        List<RoomUnlockRule> dependentRules = roomUnlockRuleRepository.findAllByPrerequisiteRoom_Id(room.getId());
        Map<UUID, List<RoomUnlockRule>> rulesByTargetRoom = dependentRules.stream()
                .collect(Collectors.groupingBy(rule -> rule.getRoom().getId()));

        for (Map.Entry<UUID, List<RoomUnlockRule>> entry : rulesByTargetRoom.entrySet()) {
            UUID targetRoomId = entry.getKey();
            List<RoomUnlockRule> allRulesForTarget = roomUnlockRuleRepository.findAllByRoom_Id(targetRoomId);

            boolean allMet = allRulesForTarget.stream().allMatch(rule -> {
                RoomProgress prereqProg = progressByRoomId.get(rule.getPrerequisiteRoom().getId());
                int played = prereqProg != null ? prereqProg.getRoundsPlayed() : 0;
                int won = prereqProg != null ? prereqProg.getRoundsWon() : 0;
                return played >= rule.getRequiredRounds()
                        && won >= rule.getRequiredWins()
                        && walletBalance >= rule.getMinimumWallet();
            });

            if (allMet) {
                GameRoom targetRoom = allRulesForTarget.getFirst().getRoom();
                RoomProgress targetProgress = progressByRoomId.computeIfAbsent(targetRoomId, id -> {
                    RoomProgress rp = new RoomProgress();
                    rp.setUser(user);
                    rp.setRoom(targetRoom);
                    rp.setRoundsPlayed(0);
                    rp.setRoundsWon(0);
                    return rp;
                });

                if (!Boolean.TRUE.equals(targetProgress.getUnlocked())) {
                    targetProgress.setUnlocked(true);
                    targetProgress.setUnlockedAt(now);
                    roomProgressRepository.save(targetProgress);
                }
            }
        }
    }
}