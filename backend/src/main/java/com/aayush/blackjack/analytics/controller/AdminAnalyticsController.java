package com.aayush.blackjack.analytics.controller;

import com.aayush.blackjack.analytics.dto.AnalyticsOverviewResponse;
import com.aayush.blackjack.analytics.dto.AnalyticsPopularityResponse;
import com.aayush.blackjack.analytics.dto.AnalyticsTrendsResponse;
import com.aayush.blackjack.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewResponse> getOverview() {
        return ResponseEntity.ok(analyticsService.getOverview());
    }

    @GetMapping("/trends")
    public ResponseEntity<AnalyticsTrendsResponse> getTrends(
            @RequestParam(name = "range", defaultValue = "month") String range
    ) {
        return ResponseEntity.ok(analyticsService.getTrends(range));
    }

    @GetMapping("/popularity")
    public ResponseEntity<AnalyticsPopularityResponse> getPopularity() {
        return ResponseEntity.ok(analyticsService.getPopularity());
    }
}