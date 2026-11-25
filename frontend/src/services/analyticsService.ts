import { apiClient } from "../lib/apiClient";
import { extractBackendMessage } from "../utils/apiError";
import { analyticsOverviewSchema, analyticsPopularitySchema, 
    analyticsRangeSchema, analyticsTrendsSchema } from "../schema/analytics.schema";
import type { AnalyticsOverviewResponse, AnalyticsPopularityResponse, AnalyticsRange, AnalyticsTrendsResponse } from "../types/analytics";

const ANALYTICS_BASE = "/admin/analytics";

export const analyticsService = {
  async getOverview(): Promise<AnalyticsOverviewResponse> {
    try {
      const { data } = await apiClient.get(`${ANALYTICS_BASE}/overview`);
      return analyticsOverviewSchema.parse(data);
    } catch (err) {
      throw new Error(
        extractBackendMessage(err, "Failed to load analytics overview.")
      );
    }
  },

  async getTrends(range: AnalyticsRange = "month"): Promise<AnalyticsTrendsResponse> {
    const validRange = analyticsRangeSchema.parse(range);
    try {
      const { data } = await apiClient.get(`${ANALYTICS_BASE}/trends`, {
        params: { range: validRange },
      });
      return analyticsTrendsSchema.parse(data);
    } catch (err) {
      throw new Error(
        extractBackendMessage(err, "Failed to load analytics trends.")
      );
    }
  },

  async getPopularity(): Promise<AnalyticsPopularityResponse> {
    try {
      const { data } = await apiClient.get(`${ANALYTICS_BASE}/popularity`);
      return analyticsPopularitySchema.parse(data);
    } catch (err) {
      throw new Error(
        extractBackendMessage(err, "Failed to load room and plan popularity.")
      );
    }
  },
};