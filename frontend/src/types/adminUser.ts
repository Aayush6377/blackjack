import type { PurchaseHistoryItem } from "./payment";

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string | null;
  enabled: boolean;
  emailVerified: boolean;
  walletBalance: number;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string | null;
  profileImagePublicId: string | null;
  role: string;
  enabled: boolean;
  emailVerified: boolean;
  walletId: string | null;
  walletBalance: number;
  totalPurchases: number;
  totalPaidInPaise: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserStatusRequest {
  enabled: boolean;
}

export interface AdjustUserChipsRequest {
  chips: number;
  reason: string;
}

export interface AdjustUserChipsResponse {
  userId: string;
  transactionId: string;
  chipsAdded: number;
  newBalance: number;
  reason: string;
  adjustedAt: string;
}

export type AdminUserPurchaseItem = PurchaseHistoryItem;