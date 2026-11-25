import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analyticsService";
import type { AnalyticsRange } from "../types/analytics";

export const ANALYTICS_QUERY_KEYS = {
  all: ["admin", "analytics"] as const,
  overview: () => [...ANALYTICS_QUERY_KEYS.all, "overview"] as const,
  trends: (range: AnalyticsRange) => [...ANALYTICS_QUERY_KEYS.all, "trends", range] as const,
  popularity: () => [...ANALYTICS_QUERY_KEYS.all, "popularity"] as const,
};

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.overview(),
    queryFn: () => analyticsService.getOverview(),
    staleTime: 60_000,
  });
}

export function useAnalyticsTrends(range: AnalyticsRange) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.trends(range),
    queryFn: () => analyticsService.getTrends(range),
    staleTime: 60_000,
  });
}

export function useAnalyticsPopularity() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.popularity(),
    queryFn: () => analyticsService.getPopularity(),
    staleTime: 60_000,
  });
}