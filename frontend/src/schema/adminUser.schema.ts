import { z } from "zod";
import { createPageResponseSchema, purchaseHistoryItemSchema } from "./payment.schema";

export const adminUserSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  profileImageUrl: z.string().nullable().optional().default(null),
  enabled: z.boolean(),
  emailVerified: z.boolean(),
  walletBalance: z.number(),
  createdAt: z.string(),
});

export const adminUserDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  profileImageUrl: z.string().nullable().optional().default(null),
  profileImagePublicId: z.string().nullable().optional().default(null),
  role: z.string(),
  enabled: z.boolean(),
  emailVerified: z.boolean(),
  walletId: z.string().nullable().optional().default(null),
  walletBalance: z.number(),
  totalPurchases: z.number(),
  totalPaidInPaise: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const updateUserStatusRequestSchema = z.object({
  enabled: z.boolean(),
});

export const adjustUserChipsRequestSchema = z.object({
  chips: z
    .number()
    .int("Chips must be a whole number")
    .positive("Chips must be greater than 0"),
  reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason must be at most 500 characters"),
});

export const adjustUserChipsResponseSchema = z.object({
  userId: z.string(),
  transactionId: z.string(),
  chipsAdded: z.number(),
  newBalance: z.number(),
  reason: z.string(),
  adjustedAt: z.string(),
});

export const adminUsersPageSchema = createPageResponseSchema(adminUserSummarySchema);
export const adminUserPurchasesPageSchema = createPageResponseSchema(
  purchaseHistoryItemSchema
);