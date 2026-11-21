package com.aayush.blackjack.reward.controller;

import com.aayush.blackjack.reward.dto.DailyRewardClaimResponse;
import com.aayush.blackjack.reward.dto.DailyRewardStatusResponse;
import com.aayush.blackjack.reward.service.DailyRewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rewards/daily")
@RequiredArgsConstructor
public class DailyRewardController {

    private final DailyRewardService dailyRewardService;

    @GetMapping
    public ResponseEntity<DailyRewardStatusResponse> getDailyRewardStatus() {
        return ResponseEntity.ok(dailyRewardService.getStatus());
    }

    @PostMapping("/claim")
    public ResponseEntity<DailyRewardClaimResponse> claimDailyReward() {
        return ResponseEntity.status(HttpStatus.CREATED).body(dailyRewardService.claimToday());
    }
}