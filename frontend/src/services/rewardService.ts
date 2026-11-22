import { z } from "zod";
import { apiClient } from "../lib/apiClient";
import {
  bulkCreateRewardConfigSchema,
  createRewardConfigSchema,
  dailyRewardClaimResponseSchema,
  dailyRewardStatusResponseSchema,
  rewardConfigResponseSchema,
  updateRewardConfigSchema,
} from "../schema/reward.schema";
import type {
  BulkCreateRewardConfigRequest,
  BulkDeleteRewardConfigRequest,
  BulkDeleteRewardConfigResponse,
  CreateRewardConfigRequest,
  DailyRewardClaimResponse,
  DailyRewardStatusResponse,
  RewardConfigResponse,
  UpdateRewardConfigRequest,
} from "../types/reward";

const USER_REWARD_BASE = "/rewards/daily";
const ADMIN_CONFIG_BASE = "/admin/rewards/configs";

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn("Reward API payload schema mismatch:", result.error.flatten());
    return data as T;
  }
  return result.data;
}

export const rewardService = {
  // user endpoints
  async getDailyRewardStatus(): Promise<DailyRewardStatusResponse> {
    const { data } = await apiClient.get<DailyRewardStatusResponse>(USER_REWARD_BASE);
    return parseWithSchema(dailyRewardStatusResponseSchema, data);
  },

  async claimDailyReward(): Promise<DailyRewardClaimResponse> {
    const { data } = await apiClient.post<DailyRewardClaimResponse>(`${USER_REWARD_BASE}/claim`);
    return parseWithSchema(dailyRewardClaimResponseSchema, data);
  },

  // admin endpoints
  async listRewardConfigs(): Promise<RewardConfigResponse[]> {
    const { data } = await apiClient.get<RewardConfigResponse[]>(ADMIN_CONFIG_BASE);
    return parseWithSchema(z.array(rewardConfigResponseSchema), data);
  },

  async createRewardConfig(payload: CreateRewardConfigRequest): Promise<RewardConfigResponse> {
    const parsedPayload = createRewardConfigSchema.parse(payload);
    const { data } = await apiClient.post<RewardConfigResponse>(ADMIN_CONFIG_BASE, parsedPayload);
    return parseWithSchema(rewardConfigResponseSchema, data);
  },

  async bulkCreateRewardConfigs(
    payload: BulkCreateRewardConfigRequest
  ): Promise<RewardConfigResponse[]> {
    const parsedPayload = bulkCreateRewardConfigSchema.parse(payload);
    const { data } = await apiClient.post<RewardConfigResponse[]>(
      `${ADMIN_CONFIG_BASE}/bulk`,
      parsedPayload
    );
    return parseWithSchema(z.array(rewardConfigResponseSchema), data);
  },

  async updateRewardConfig(
    configId: string,
    payload: UpdateRewardConfigRequest
  ): Promise<RewardConfigResponse> {
    const parsedPayload = updateRewardConfigSchema.parse(payload);
    const { data } = await apiClient.put<RewardConfigResponse>(
      `${ADMIN_CONFIG_BASE}/${configId}`,
      parsedPayload
    );
    return parseWithSchema(rewardConfigResponseSchema, data);
  },

  async deleteRewardConfig(configId: string): Promise<RewardConfigResponse[]> {
    const { data } = await apiClient.delete<RewardConfigResponse[]>(
      `${ADMIN_CONFIG_BASE}/${configId}`
    );
    return parseWithSchema(z.array(rewardConfigResponseSchema), data);
  },

  async bulkDeleteRewardConfigs(payload: BulkDeleteRewardConfigRequest): Promise<BulkDeleteRewardConfigResponse> {
    const response = await apiClient.post<BulkDeleteRewardConfigResponse>(
      `${ADMIN_CONFIG_BASE}/bulk-delete`,
      payload
    );
    return response.data;
  },
};