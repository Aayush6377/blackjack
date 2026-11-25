import { z } from "zod";

export const analyticsRangeSchema = z.enum(["week", "month", "year"]);

export const analyticsOverviewSchema = z.object({
  totalNonAdminUsers: z.number().nonnegative(),
  activeRooms: z.number().nonnegative(),
  activePlans: z.number().nonnegative(),
  totalRevenue: z.coerce.number().nonnegative(),
  totalCompletedPurchases: z.number().nonnegative(),
});

export const timeSeriesPointSchema = z.object({
  label: z.string(),
  newUsers: z.number().nonnegative(),
  revenue: z.coerce.number().nonnegative(),
  purchasesCount: z.number().nonnegative(),
});

export const analyticsTrendsSchema = z.object({
  range: analyticsRangeSchema,
  points: z.array(timeSeriesPointSchema),
});

export const popularitySliceSchema = z.object({
  id: z.string(),
  name: z.string(),
  count: z.number().nonnegative(),
  revenue: z.coerce.number().nonnegative(),
});

export const analyticsPopularitySchema = z.object({
  activeRooms: z.array(popularitySliceSchema),
  activePlans: z.array(popularitySliceSchema),
});

export type AnalyticsRangeInput = z.infer<typeof analyticsRangeSchema>;