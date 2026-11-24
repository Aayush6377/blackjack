import { z } from "zod";
import type { PageResponse } from "../types/page";

export const createPaymentOrderRequestSchema = z.object({
  planId: z.string().trim().min(1, "Plan ID is required"),
});

export const createPaymentOrderResponseSchema = z.object({
  purchaseId: z.string(),
  razorpayOrderId: z.string(),
  amountInPaise: z.number(),
  currency: z.string(),
  keyId: z.string(),
  planName: z.string(),
  chipsAwarded: z.number(),
});

export const verifyPaymentRequestSchema = z.object({
  razorpayOrderId: z.string().trim().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().trim().min(1, "Razorpay payment ID is required"),
  razorpaySignature: z.string().trim().min(1, "Razorpay signature is required"),
});

export const paymentVerificationResponseSchema = z.object({
  purchaseId: z.string(),
  status: z.string(),
  chipsAwarded: z.number(),
});

export const purchaseHistoryItemSchema = z.object({
  id: z.string(),
  planId: z.string().nullable(),
  planName: z.string(),
  chipsAwarded: z.number(),
  amountInPaise: z.number(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export function createPageResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    page: z.number(),
    limit: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
    first: z.boolean(),
    last: z.boolean(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  }) as z.ZodType<PageResponse<z.infer<T>>>;
}