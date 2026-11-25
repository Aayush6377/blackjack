package com.aayush.blackjack.analytics.dto;

import java.util.List;

public record AnalyticsPopularityResponse(
        List<PopularitySlice> activeRooms,
        List<PopularitySlice> activePlans
) {}