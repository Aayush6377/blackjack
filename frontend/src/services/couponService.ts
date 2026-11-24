import { z } from "zod";
import { apiClient } from "../lib/apiClient";
import {
  couponRedemptionHistoryResponseSchema,
  couponResponseSchema,
  createCouponRequestSchema,
  redeemCouponRequestSchema,
  redeemCouponResponseSchema,
  updateCouponRequestSchema,
} from "../schema/coupon.schema";
import type {
  CouponRedemptionHistoryResponse,
  CouponResponse,
  CreateCouponRequest,
  RedeemCouponRequest,
  RedeemCouponResponse,
  UpdateCouponRequest,
} from "../types/coupon";
import { extractBackendMessage } from "../utils/apiError";

const USER_COUPONS_BASE = "/coupons";
const ADMIN_COUPONS_BASE = "/admin/coupons";

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn("Coupon API payload schema mismatch:", result.error.flatten());
    return data as T;
  }
  return result.data;
}

export const couponService = {
  // User endpoints
  async redeemCoupon(payload: RedeemCouponRequest): Promise<RedeemCouponResponse> {
    const parsedPayload = redeemCouponRequestSchema.parse(payload);
    try {
      const { data } = await apiClient.post<RedeemCouponResponse>(
        `${USER_COUPONS_BASE}/redeem`, parsedPayload
      );
      return parseWithSchema(redeemCouponResponseSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Unable to redeem coupon code"));
    }
  },

  async getMyRedemptions(): Promise<CouponRedemptionHistoryResponse[]> {
    try {
      const { data } = await apiClient.get<CouponRedemptionHistoryResponse[]>(
        `${USER_COUPONS_BASE}/redemptions/me`
      );
      return parseWithSchema(z.array(couponRedemptionHistoryResponseSchema), data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load coupon redemptions"));
    }
  },

  // Admin endpoints
  async listAllCoupons(): Promise<CouponResponse[]> {
    try {
      const { data } = await apiClient.get<CouponResponse[]>(ADMIN_COUPONS_BASE);
      return parseWithSchema(z.array(couponResponseSchema), data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load coupons"));
    }
  },

  async getAdminCouponById(couponId: string): Promise<CouponResponse> {
    try {
      const { data } = await apiClient.get<CouponResponse>(
        `${ADMIN_COUPONS_BASE}/${couponId}`
      );
      return parseWithSchema(couponResponseSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load coupon details"));
    }
  },

  async createCoupon(payload: CreateCouponRequest): Promise<CouponResponse> {
    const parsedPayload = createCouponRequestSchema.parse(payload);
    try {
      const { data } = await apiClient.post<CouponResponse>(
        ADMIN_COUPONS_BASE, parsedPayload
      );
      return parseWithSchema(couponResponseSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to create coupon"));
    }
  },

  async updateCoupon( couponId: string, payload: UpdateCouponRequest): Promise<CouponResponse> {
    const parsedPayload = updateCouponRequestSchema.parse(payload);
    try {
      const { data } = await apiClient.put<CouponResponse>(
        `${ADMIN_COUPONS_BASE}/${couponId}`, parsedPayload
      );
      return parseWithSchema(couponResponseSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to update coupon"));
    }
  },

  async setCouponActive( couponId: string, active: boolean ): Promise<CouponResponse> {
    try {
      const { data } = await apiClient.patch<CouponResponse>(
        `${ADMIN_COUPONS_BASE}/${couponId}/active`,
         null,
        { params: { active } }
      );
      return parseWithSchema(couponResponseSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err,
          active ? "Failed to activate coupon" : "Failed to deactivate coupon"
        )
      );
    }
  },

  async deleteCoupon(couponId: string): Promise<void> {
    try {
      await apiClient.delete(`${ADMIN_COUPONS_BASE}/${couponId}`);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to delete coupon"));
    }
  },
};