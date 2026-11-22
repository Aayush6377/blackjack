import { z } from "zod";

export const chipPlanResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional().transform((val) => val ?? null),
  chips: z.number(),
  bonusChips: z.number(),
  totalChips: z.number(),
  priceInPaise: z.number(),
  effectivePriceInPaise: z.number(),
  onSale: z.boolean(),
  active: z.boolean(),
  salePriceInPaise: z.number().nullable().optional().transform((val) => val ?? null),
  saleName: z.string().nullable().optional().transform((val) => val ?? null),
  saleStartAt: z.string().nullable().optional().transform((val) => val ?? null),
  saleEndAt: z.string().nullable().optional().transform((val) => val ?? null),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createChipPlanSchema = z.object({
  name: z.string().trim().min(1, "Plan name is required").max(120),
  description: z.string().max(2000).nullable().optional(),
  chips: z.number().int().min(1, "Chips must be at least 1"),
  bonusChips: z.number().int().min(0).nullable().optional(),
  priceInPaise: z.number().int().min(0, "Price cannot be negative"),
  active: z.boolean().nullable().optional(),
  salePriceInPaise: z.number().int().min(0).nullable().optional(),
  saleName: z.string().max(120).nullable().optional(),
  saleStartAt: z.string().nullable().optional(),
  saleEndAt: z.string().nullable().optional(),
});

export const updateChipPlanSchema = z.object({
  name: z.string().trim().min(1).max(120).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  chips: z.number().int().min(1).nullable().optional(),
  bonusChips: z.number().int().min(0).nullable().optional(),
  priceInPaise: z.number().int().min(0).nullable().optional(),
  active: z.boolean().nullable().optional(),
  salePriceInPaise: z.number().int().min(0).nullable().optional(),
  saleName: z.string().max(120).nullable().optional(),
  saleStartAt: z.string().nullable().optional(),
  saleEndAt: z.string().nullable().optional(),
  clearSale: z.boolean().nullable().optional(),
});