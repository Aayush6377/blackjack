import { z } from "zod";

const optionalPositiveInt = z
  .union([z.number().int().min(1, "Must be at least 1"), z.undefined(), z.null()])
  .transform((val) => (typeof val === "number" ? val : undefined));

const optionalNonNegativeInt = z
  .union([
    z.number().int().min(0, "Cannot be negative"),
    z.undefined(),
    z.null(),
  ])
  .transform((val) => (typeof val === "number" ? val : undefined));

export const rewardConfigResponseSchema = z.object({
  id: z.string().min(1),
  dayNumber: z.number().int().min(1),
  chipsReward: z.number().int().min(1),
  active: z.boolean(),
  createdAt: z.string(),
});

export const createRewardConfigSchema = z.object({
  dayNumber: optionalPositiveInt,
  chipsReward: z
    .number({ error: "Chips reward is required" })
    .int("Chips reward must be a whole number")
    .min(1, "Chips reward must be at least 1"),
  active: z.boolean().optional().default(true),
});

export const bulkCreateRewardConfigSchema = z
  .object({
    days: z
      .number({ error: "Days count is required" })
      .int("Days must be a whole number")
      .min(1, "Must create at least 1 day")
      .max(365, "Cannot exceed 365 days in one batch"),
    startDay: optionalPositiveInt,
    baseChipsReward: z
      .number({ error: "Base chips reward is required" })
      .int("Base chips reward must be a whole number")
      .min(1, "Base chips reward must be at least 1"),
    incrementPerDay: optionalNonNegativeInt,
    active: z.boolean().optional().default(true),
    explicitRewards: z
      .array(z.number().int().min(1, "Each day reward must be at least 1"))
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.explicitRewards && data.explicitRewards.length > 0) {
      if (data.explicitRewards.length !== data.days) {
        ctx.addIssue({
          code: "custom",
          path: ["explicitRewards"],
          message: `Explicit rewards count (${data.explicitRewards.length}) must match days (${data.days})`,
        });
      }
    }
  });

export const updateRewardConfigSchema = z.object({
  dayNumber: optionalPositiveInt,
  chipsReward: z
    .union([
      z.number().int("Chips reward must be a whole number").min(1, "Must be at least 1"),
      z.undefined(),
      z.null(),
    ])
    .transform((val) => (typeof val === "number" ? val : undefined)),
  active: z.boolean().optional(),
});

export const dailyRewardClaimResponseSchema = z.object({
  claimId: z.string().min(1),
  rewardConfigId: z.string().min(1),
  dayNumber: z.number().int().min(1),
  rewardDate: z.string(),
  chipsCredited: z.number().int().min(0),
  walletBalanceAfter: z.number().int().min(0),
  claimedAt: z.string(),
});

export const dailyRewardStatusResponseSchema = z.object({
  today: z.string(),
  claimedToday: z.boolean(),
  currentStreakDay: z.number().int().min(0),
  nextRewardDay: z.number().int().min(1),
  nextChipsReward: z.number().int().min(0),
  totalConfiguredDays: z.number().int().min(0),
  walletBalance: z.number().int().min(0),
  schedule: z.array(rewardConfigResponseSchema),
  recentClaims: z.array(dailyRewardClaimResponseSchema),
});

export type CreateRewardConfigFormValues = z.infer<typeof createRewardConfigSchema>;
export type BulkCreateRewardConfigFormValues = z.infer<typeof bulkCreateRewardConfigSchema>;
export type UpdateRewardConfigFormValues = z.infer<typeof updateRewardConfigSchema>;