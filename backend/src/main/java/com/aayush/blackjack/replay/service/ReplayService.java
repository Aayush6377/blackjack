package com.aayush.blackjack.replay.service;

import com.aayush.blackjack.common.dto.PageRequest;
import com.aayush.blackjack.common.dto.PageResponse;
import com.aayush.blackjack.game.entity.GameHand;
import com.aayush.blackjack.game.entity.GameRound;
import com.aayush.blackjack.game.repository.GameActionRepository;
import com.aayush.blackjack.game.repository.GameHandRepository;
import com.aayush.blackjack.game.repository.GameRoundRepository;
import com.aayush.blackjack.replay.dto.ReplayActionItemResponse;
import com.aayush.blackjack.replay.dto.RoundReplayResponse;
import com.aayush.blackjack.replay.dto.RoundSummaryResponse;
import com.aayush.blackjack.security.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReplayService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "startedAt",
            "completedAt",
            "originalBet",
            "totalBet",
            "totalPayout",
            "netResult",
            "status",
            "outcome"
    );

    private final GameRoundRepository gameRoundRepository;
    private final GameHandRepository gameHandRepository;
    private final GameActionRepository gameActionRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public PageResponse<RoundSummaryResponse> getMyRounds(PageRequest<Void> request) {
        UUID userId = currentUserService.getCurrentUserId();
        PageRequest<Void> safeRequest = request != null
                ? request
                : new PageRequest<>(0, 10, "startedAt", "DESC", "", null);

        Pageable pageable = safeRequest.toPageable(ALLOWED_SORT_FIELDS, "startedAt");
        String search = safeRequest.normalizedSearch();

        Page<GameRound> page = search.isEmpty()
                ? gameRoundRepository.findAllByUser_Id(userId, pageable)
                : gameRoundRepository.searchUserRounds(userId, search, pageable);

        return PageResponse.from(page, RoundSummaryResponse::from);
    }

    @Transactional(readOnly = true)
    public RoundReplayResponse getRoundReplay(UUID roundId) {
        UUID userId = currentUserService.getCurrentUserId();

        GameRound round = gameRoundRepository.findByIdAndUser_Id(roundId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Game round not found or not accessible"));

        List<GameHand> hands = gameHandRepository.findAllByGameRoundOrderByHandNumberAsc(round);
        List<ReplayActionItemResponse> actions = gameActionRepository
                .findAllByGameRound_IdOrderBySequenceNumberAsc(roundId)
                .stream()
                .map(ReplayActionItemResponse::from)
                .toList();

        return new RoundReplayResponse(
                RoundSummaryResponse.from(round),
                hands.stream().map(RoundReplayResponse.HandSnapshot::from).toList(),
                actions
        );
    }
}