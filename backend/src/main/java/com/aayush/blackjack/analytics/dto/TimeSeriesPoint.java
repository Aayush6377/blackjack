package com.aayush.blackjack.analytics.dto;

import java.math.BigDecimal;

public record TimeSeriesPoint(
        String label,
        long newUsers,
        BigDecimal revenue,
        long purchasesCount
) {}