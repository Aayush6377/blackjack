export type AnalyticsRange = "week" | "month" | "year";

export interface AnalyticsOverviewResponse {
  totalNonAdminUsers: number;
  activeRooms: number;
  activePlans: number;
  totalRevenue: number;
  totalCompletedPurchases: number;
}

export interface TimeSeriesPoint {
  label: string;
  newUsers: number;
  revenue: number;
  purchasesCount: number;
}

export interface AnalyticsTrendsResponse {
  range: AnalyticsRange;
  points: TimeSeriesPoint[];
}

export interface PopularitySlice {
  id: string;
  name: string;
  count: number;
  revenue: number;
}

export interface AnalyticsPopularityResponse {
  activeRooms: PopularitySlice[];
  activePlans: PopularitySlice[];
}