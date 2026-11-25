package com.aayush.blackjack.analytics.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PopularitySlice(
        UUID id,
        String name,
        long count,
        BigDecimal revenue
) {}