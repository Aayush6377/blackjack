export interface RewardConfigResponse {
  id: string;
  dayNumber: number;
  chipsReward: number;
  active: boolean;
  createdAt: string;
}

export interface CreateRewardConfigRequest {
  dayNumber?: number;
  chipsReward: number;
  active?: boolean;
}

export interface BulkCreateRewardConfigRequest {
  days: number;
  startDay?: number;
  baseChipsReward: number;
  incrementPerDay?: number;
  active?: boolean;
  explicitRewards?: number[];
}

export interface UpdateRewardConfigRequest {
  dayNumber?: number;
  chipsReward?: number;
  active?: boolean;
}

export interface DailyRewardClaimResponse {
  claimId: string;
  rewardConfigId: string;
  dayNumber: number;
  rewardDate: string;
  chipsCredited: number;
  walletBalanceAfter: number;
  claimedAt: string;
}

export interface DailyRewardStatusResponse {
  today: string;
  claimedToday: boolean;
  currentStreakDay: number;
  nextRewardDay: number;
  nextChipsReward: number;
  totalConfiguredDays: number;
  walletBalance: number;
  schedule: RewardConfigResponse[];
  recentClaims: DailyRewardClaimResponse[];
}

export interface BulkDeleteRewardConfigRequest {
  startDay?: number;
  endDay?: number;
  dayNumbers?: number[];
}

export interface BulkDeleteRewardConfigResponse {
  deletedCount: number;
  deletedDayNumbers: number[];
  remainingConfigs: RewardConfigResponse[];
}