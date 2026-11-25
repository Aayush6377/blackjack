package com.aayush.blackjack.analytics.service;

import com.aayush.blackjack.analytics.dto.*;
import com.aayush.blackjack.analytics.repository.AnalyticsRepository;
import com.aayush.blackjack.payment.enums.PurchaseStatus;
import com.aayush.blackjack.user.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    public AnalyticsOverviewResponse getOverview() {
        long totalNonAdminUsers = analyticsRepository.countExcludeUsers(Role.ADMIN);
        long activeRooms = analyticsRepository.countActiveRooms();
        long activePlans = analyticsRepository.countActivePlans();
        Long totalRevenue = analyticsRepository.sumTotalRevenue(PurchaseStatus.SUCCESS);
        long totalCompletedPurchases = analyticsRepository.countCompletedPurchases(PurchaseStatus.SUCCESS);

        return new AnalyticsOverviewResponse(
                totalNonAdminUsers,
                activeRooms,
                activePlans,
                totalRevenue,
                totalCompletedPurchases
        );
    }

    public AnalyticsTrendsResponse getTrends(String rawRange) {
        String range = (rawRange == null ? "month" : rawRange.trim().toLowerCase(Locale.ROOT));
        return switch (range) {
            case "week" -> buildDailyTrends("week", 7);
            case "year" -> buildMonthlyTrends("year", 12);
            case "month" -> buildDailyTrends("month", 30);
            default -> throw new IllegalArgumentException("Invalid range '" + rawRange + "'. Allowed values: week, month, year.");
        };
    }

    public AnalyticsPopularityResponse getPopularity() {
        List<PopularitySlice> rooms = analyticsRepository.findActiveRoomPopularity().stream()
                .map(row -> new PopularitySlice(
                        (UUID) row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        BigDecimal.ZERO
                ))
                .toList();

        List<PopularitySlice> plans = analyticsRepository.findActivePlanPopularity(PurchaseStatus.SUCCESS).stream()
                .map(row -> new PopularitySlice(
                        (UUID) row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        toBigDecimal(row[3])
                ))
                .toList();

        return new AnalyticsPopularityResponse(rooms, plans);
    }

    private AnalyticsTrendsResponse buildDailyTrends(String range, int days) {
        LocalDate todayUtc = LocalDate.now(ZoneOffset.UTC);
        LocalDate startDate = todayUtc.minusDays(days - 1L);
        Instant since = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd", Locale.ENGLISH);
        Map<LocalDate, MutableBucket> buckets = new LinkedHashMap<>();
        for (int i = 0; i < days; i++) {
            LocalDate day = startDate.plusDays(i);
            buckets.put(day, new MutableBucket(day.format(formatter)));
        }

        for (Instant createdAt : analyticsRepository.findNonAdminUserSignupTimestampsSince(Role.ADMIN, since)) {
            if (createdAt == null) continue;
            LocalDate day = createdAt.atZone(ZoneOffset.UTC).toLocalDate();
            MutableBucket bucket = buckets.get(day);
            if (bucket != null) {
                bucket.newUsers++;
            }
        }

        for (Object[] row : analyticsRepository.findPurchaseTimestampsAndAmountsSince(PurchaseStatus.SUCCESS, since)) {
            Instant createdAt = (Instant) row[0];
            if (createdAt == null) continue;
            LocalDate day = createdAt.atZone(ZoneOffset.UTC).toLocalDate();
            MutableBucket bucket = buckets.get(day);
            if (bucket != null) {
                bucket.revenue = bucket.revenue.add(toBigDecimal(row[1]));
                bucket.purchasesCount++;
            }
        }

        return new AnalyticsTrendsResponse(range, toPoints(buckets.values()));
    }

    private AnalyticsTrendsResponse buildMonthlyTrends(String range, int months) {
        YearMonth currentMonth = YearMonth.now(ZoneOffset.UTC);
        YearMonth startMonth = currentMonth.minusMonths(months - 1L);
        Instant since = startMonth.atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);
        Map<YearMonth, MutableBucket> buckets = new LinkedHashMap<>();
        for (int i = 0; i < months; i++) {
            YearMonth ym = startMonth.plusMonths(i);
            buckets.put(ym, new MutableBucket(ym.format(formatter)));
        }

        for (Instant createdAt : analyticsRepository.findNonAdminUserSignupTimestampsSince(Role.ADMIN, since)) {
            if (createdAt == null) continue;
            YearMonth ym = YearMonth.from(createdAt.atZone(ZoneOffset.UTC));
            MutableBucket bucket = buckets.get(ym);
            if (bucket != null) {
                bucket.newUsers++;
            }
        }

        for (Object[] row : analyticsRepository.findPurchaseTimestampsAndAmountsSince(PurchaseStatus.SUCCESS, since)) {
            Instant createdAt = (Instant) row[0];
            if (createdAt == null) continue;
            YearMonth ym = YearMonth.from(createdAt.atZone(ZoneOffset.UTC));
            MutableBucket bucket = buckets.get(ym);
            if (bucket != null) {
                bucket.revenue = bucket.revenue.add(toBigDecimal(row[1]));
                bucket.purchasesCount++;
            }
        }

        return new AnalyticsTrendsResponse(range, toPoints(buckets.values()));
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number num) return BigDecimal.valueOf(num.longValue());
        return new BigDecimal(value.toString());
    }

    private List<TimeSeriesPoint> toPoints(Iterable<MutableBucket> values) {
        List<TimeSeriesPoint> result = new ArrayList<>();
        for (MutableBucket b : values) {
            result.add(new TimeSeriesPoint(b.label, b.newUsers, b.revenue, b.purchasesCount));
        }
        return result;
    }

    private static final class MutableBucket {
        final String label;
        long newUsers = 0;
        BigDecimal revenue = BigDecimal.ZERO;
        long purchasesCount = 0;

        MutableBucket(String label) {
            this.label = label;
        }
    }
}