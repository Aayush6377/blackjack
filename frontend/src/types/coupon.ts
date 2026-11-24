export interface CouponResponse {
  id: string;
  code: string;
  description: string | null;
  chipReward: number;
  maxUsesPerUser: number;
  maxTotalUses: number | null;
  timesRedeemed: number;
  active: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponRequest {
  code: string;
  description?: string | null;
  chipReward: number;
  maxUsesPerUser?: number | null;
  maxTotalUses?: number | null;
  active?: boolean | null;
  startsAt?: string | null;
  expiresAt?: string | null;
}

export interface UpdateCouponRequest {
  code?: string | null;
  description?: string | null;
  chipReward?: number | null;
  maxUsesPerUser?: number | null;
  maxTotalUses?: number | null;
  active?: boolean | null;
  startsAt?: string | null;
  expiresAt?: string | null;
}

export interface RedeemCouponRequest {
  code: string;
}

export interface RedeemCouponResponse {
  redemptionId: string;
  code: string;
  chipsAwarded: number;
  updatedWalletBalance: number;
  redeemedAt: string;
}

export interface CouponRedemptionHistoryResponse {
  id: string;
  code: string;
  chipsAwarded: number;
  redeemedAt: string;
}