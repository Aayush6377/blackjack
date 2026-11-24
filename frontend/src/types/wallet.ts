export type TransactionType =
  | "BET_PLACED"
  | "INSURANCE_PLACED"
  | "ADDITIONAL_BET"
  | "WIN_PAYOUT"
  | "PUSH_REFUND"
  | "SURRENDER_REFUND"
  | "CHIP_PURCHASE"
  | "REWARD_CLAIM"
  | "COUPON_REWARD"
  | "ADMIN_ADJUSTMENT";

export interface WalletSummary {
  walletId: string;
  balance: number;
  updatedAt?: string;
}

export interface ChipTransaction {
  id: string;
  roundId: string | null;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  createdAt: string;
}