package com.aayush.blackjack.analytics.dto;

public record AnalyticsOverviewResponse(
        long totalNonAdminUsers,
        long activeRooms,
        long activePlans,
        long totalRevenue,
        long totalCompletedPurchases
) {}