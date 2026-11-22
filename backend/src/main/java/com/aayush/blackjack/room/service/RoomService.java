package com.aayush.blackjack.room.service;

import com.aayush.blackjack.room.dto.RoomProgressDto;
import com.aayush.blackjack.room.dto.RoomRulesDto;
import com.aayush.blackjack.room.dto.RoomSummaryResponse;
import com.aayush.blackjack.room.dto.UnlockRequirementDto;
import com.aayush.blackjack.room.entity.GameRoom;
import com.aayush.blackjack.room.entity.RoomProgress;
import com.aayush.blackjack.room.entity.RoomUnlockRule;
import com.aayush.blackjack.room.repository.GameRoomRepository;
import com.aayush.blackjack.room.repository.RoomProgressRepository;
import com.aayush.blackjack.room.repository.RoomUnlockRuleRepository;
import com.aayush.blackjack.security.service.CurrentUserService;
import com.aayush.blackjack.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final GameRoomRepository gameRoomRepository;
    private final RoomProgressRepository roomProgressRepository;
    private final RoomUnlockRuleRepository roomUnlockRuleRepository;
    private final CurrentUserService currentUserService;
    private final WalletService walletService;

    @Transactional(readOnly = true)
    public List<RoomSummaryResponse> getAllRoomsForCurrentUser() {
        UUID userId = currentUserService.getCurrentUserId();
        long walletBalance = walletService.getBalance(userId);

        List<GameRoom> activeRooms = gameRoomRepository.findAllByActiveTrueOrderByDisplayOrderAsc();
        Map<UUID, RoomProgress> progressByRoomId = roomProgressRepository.findAllByUser_Id(userId)
                .stream()
                .collect(Collectors.toMap(rp -> rp.getRoom().getId(), Function.identity(), (a, b) -> a));

        Map<UUID, List<RoomUnlockRule>> rulesByRoomId = roomUnlockRuleRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(rule -> rule.getRoom().getId()));

        return activeRooms.stream()
                .map(room -> toRoomSummary(room, progressByRoomId, rulesByRoomId.getOrDefault(room.getId(), List.of()), walletBalance))
                .toList();
    }

    @Transactional(readOnly = true)
    public RoomSummaryResponse getRoomBySlugForCurrentUser(String slug) {
        UUID userId = currentUserService.getCurrentUserId();
        long walletBalance = walletService.getBalance(userId);

        String normalizedSlug = slug == null ? "" : slug.trim();

        GameRoom room = gameRoomRepository.findBySlug(normalizedSlug)
                .filter(r -> Boolean.TRUE.equals(r.getActive()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Game room not found"));

        Map<UUID, RoomProgress> progressByRoomId = roomProgressRepository.findAllByUser_Id(userId)
                .stream()
                .collect(Collectors.toMap(rp -> rp.getRoom().getId(), Function.identity(), (a, b) -> a));

        List<RoomUnlockRule> roomRules = roomUnlockRuleRepository.findAllByRoom_Id(room.getId());

        return toRoomSummary(room, progressByRoomId, roomRules, walletBalance);
    }

    private RoomSummaryResponse toRoomSummary(
            GameRoom room,
            Map<UUID, RoomProgress> progressByRoomId,
            List<RoomUnlockRule> unlockRules,
            long walletBalance
    ) {
        RoomProgress progress = progressByRoomId.get(room.getId());

        int roundsPlayed = progress != null ? progress.getRoundsPlayed() : 0;
        int roundsWon = progress != null ? progress.getRoundsWon() : 0;

        List<UnlockRequirementDto> requirementDtos = unlockRules.stream()
                .map(rule -> {
                    GameRoom prereq = rule.getPrerequisiteRoom();
                    RoomProgress prereqProgress = progressByRoomId.get(prereq.getId());
                    int prereqPlayed = prereqProgress != null ? prereqProgress.getRoundsPlayed() : 0;
                    int prereqWon = prereqProgress != null ? prereqProgress.getRoundsWon() : 0;

                    boolean met = prereqPlayed >= rule.getRequiredRounds()
                            && prereqWon >= rule.getRequiredWins()
                            && walletBalance >= rule.getMinimumWallet();

                    return UnlockRequirementDto.builder()
                            .prerequisiteRoomId(prereq.getId())
                            .prerequisiteRoomName(prereq.getName())
                            .prerequisiteRoomSlug(prereq.getSlug())
                            .requiredRounds(rule.getRequiredRounds())
                            .requiredWins(rule.getRequiredWins())
                            .minimumWallet(rule.getMinimumWallet())
                            .met(met)
                            .build();
                })
                .toList();

        boolean unlocked = (progress != null && Boolean.TRUE.equals(progress.getUnlocked()))
                || unlockRules.isEmpty()
                || requirementDtos.stream().allMatch(UnlockRequirementDto::met);

        boolean eligibleToPlay = unlocked
                && walletBalance >= room.getMinWallet()
                && walletBalance >= room.getMinBet();

        RoomRulesDto rulesDto = RoomRulesDto.builder()
                .minWallet(room.getMinWallet())
                .minBet(room.getMinBet())
                .maxBet(room.getMaxBet())
                .decksPerShoe(room.getDecksPerShoe())
                .reshuffleThreshold(room.getReshuffleThreshold())
                .blackjackPayout(room.getBlackjackPayout())
                .dealerHitsSoft17(room.getDealerHitsSoft17())
                .build();

        RoomProgressDto progressDto = RoomProgressDto.builder()
                .roundsPlayed(roundsPlayed)
                .roundsWon(roundsWon)
                .unlocked(unlocked)
                .unlockedAt(progress != null ? progress.getUnlockedAt() : null)
                .build();

        return RoomSummaryResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .slug(room.getSlug())
                .description(room.getDescription())
                .difficulty(room.getDifficulty())
                .backgroundUrl(room.getBackgroundUrl())
                .thumbnailUrl(room.getThumbnailUrl())
                .displayOrder(room.getDisplayOrder())
                .unlocked(unlocked)
                .eligibleToPlay(eligibleToPlay)
                .rules(rulesDto)
                .progress(progressDto)
                .unlockRequirements(requirementDtos)
                .build();
    }
}
