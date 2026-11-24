import { z } from "zod";
import { apiClient } from "../lib/apiClient";
import { createPaymentOrderRequestSchema, createPaymentOrderResponseSchema, paymentVerificationResponseSchema, 
  purchaseHistoryItemSchema, verifyPaymentRequestSchema } from "../schema/payment.schema";
import type { CreatePaymentOrderRequest, CreatePaymentOrderResponse, PaymentVerificationResponse, 
  PurchaseHistoryItem, VerifyPaymentRequest } from "../types/payment";
import type { PageQueryParams, PageResponse } from "../types/page";
import { createPageResponseSchema } from "../schema/page.schema";

const PAYMENTS_BASE = "/payments";

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn("Payment API payload schema mismatch:", result.error.flatten());
    return data as T;
  }
  return result.data;
}

export const paymentService = {
  async createOrder(payload: CreatePaymentOrderRequest): Promise<CreatePaymentOrderResponse> {
    const parsedPayload = createPaymentOrderRequestSchema.parse(payload);
    const { data } = await apiClient.post<CreatePaymentOrderResponse>(
      `${PAYMENTS_BASE}/orders`,
      parsedPayload
    );
    return parseWithSchema(createPaymentOrderResponseSchema, data);
  },

  async verifyPayment(payload: VerifyPaymentRequest): Promise<PaymentVerificationResponse> {
    const parsedPayload = verifyPaymentRequestSchema.parse(payload);
    const { data } = await apiClient.post<PaymentVerificationResponse>(
      `${PAYMENTS_BASE}/verify`,
      parsedPayload
    );
    return parseWithSchema(paymentVerificationResponseSchema, data);
  },

  async getMyPurchases( params: PageQueryParams = {} ): Promise<PageResponse<PurchaseHistoryItem>> {
    const { page = 0, limit = 10 } = params;
    const { data } = await apiClient.get<PageResponse<PurchaseHistoryItem>>(
      `${PAYMENTS_BASE}/purchases`,
      { params: { page, limit } }
    );
    return parseWithSchema(createPageResponseSchema(purchaseHistoryItemSchema), data);
  },
};