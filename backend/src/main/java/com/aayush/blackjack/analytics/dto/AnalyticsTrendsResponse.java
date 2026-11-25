package com.aayush.blackjack.analytics.dto;

import java.util.List;

public record AnalyticsTrendsResponse(
        String range,
        List<TimeSeriesPoint> points
) {}