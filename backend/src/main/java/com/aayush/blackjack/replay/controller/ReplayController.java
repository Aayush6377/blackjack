package com.aayush.blackjack.replay.controller;

import com.aayush.blackjack.common.dto.PageRequest;
import com.aayush.blackjack.common.dto.PageResponse;
import com.aayush.blackjack.replay.dto.ReplayActionItemResponse;
import com.aayush.blackjack.replay.dto.RoundReplayResponse;
import com.aayush.blackjack.replay.dto.RoundSummaryResponse;
import com.aayush.blackjack.replay.service.ReplayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/replays")
@RequiredArgsConstructor
public class ReplayController {

    private final ReplayService replayService;

    @GetMapping("/rounds")
    public ResponseEntity<PageResponse<RoundSummaryResponse>> listRounds(
            @ModelAttribute PageRequest<Void> pageRequest
    ) {
        return ResponseEntity.ok(replayService.getMyRounds(pageRequest));
    }

    @GetMapping("/rounds/{roundId}")
    public ResponseEntity<RoundReplayResponse> getFullReplay(@PathVariable UUID roundId) {
        return ResponseEntity.ok(replayService.getRoundReplay(roundId));
    }

    @GetMapping("/rounds/{roundId}/actions")
    public ResponseEntity<List<ReplayActionItemResponse>> getRoundActions(@PathVariable UUID roundId) {
        return ResponseEntity.ok(replayService.getRoundReplay(roundId).actions());
    }
}