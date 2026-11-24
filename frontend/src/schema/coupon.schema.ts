import { z } from "zod";

const nullableString = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();

export const couponResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  chipReward: z.number(),
  maxUsesPerUser: z.number(),
  maxTotalUses: z.number().nullable(),
  timesRedeemed: z.number(),
  active: z.boolean(),
  startsAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createCouponRequestSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Coupon code is required")
    .max(60, "Coupon code must be at most 60 characters"),
  description: z
    .string()
    .max(255, "Description must be at most 255 characters")
    .nullable()
    .optional(),
  chipReward: z.number().int().min(1, "Chip reward must be at least 1"),
  maxUsesPerUser: z.number().int().min(1).nullable().optional(),
  maxTotalUses: z.number().int().min(1).nullable().optional(),
  active: z.boolean().nullable().optional(),
  startsAt: nullableString,
  expiresAt: nullableString,
});

export const updateCouponRequestSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Coupon code cannot be empty")
    .max(60)
    .nullable()
    .optional(),
  description: z.string().max(255).nullable().optional(),
  chipReward: z.number().int().min(1).nullable().optional(),
  maxUsesPerUser: z.number().int().min(1).nullable().optional(),
  maxTotalUses: nullableNumber,
  active: z.boolean().nullable().optional(),
  startsAt: nullableString,
  expiresAt: nullableString,
});

export const redeemCouponRequestSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Enter a coupon code")
    .max(60, "Coupon code must be at most 60 characters"),
});

export const redeemCouponResponseSchema = z.object({
  redemptionId: z.string(),
  code: z.string(),
  chipsAwarded: z.number(),
  updatedWalletBalance: z.number(),
  redeemedAt: z.string(),
});

export const couponRedemptionHistoryResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  chipsAwarded: z.number(),
  redeemedAt: z.string(),
});