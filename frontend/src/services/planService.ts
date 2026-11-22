import { z } from "zod";
import { apiClient } from "../lib/apiClient";
import {
  chipPlanResponseSchema,
  createChipPlanSchema,
  updateChipPlanSchema,
} from "../schema/plan.schema";
import type {
  ChipPlanResponse,
  CreateChipPlanRequest,
  UpdateChipPlanRequest,
} from "../types/plan";

const USER_PLANS_BASE = "/plans";
const ADMIN_PLANS_BASE = "/admin/plans";

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn("Plan API payload schema mismatch:", result.error.flatten());
    return data as T;
  }
  return result.data;
}

export const planService = {
  // User endpoints
  async getActivePlans(): Promise<ChipPlanResponse[]> {
    const { data } = await apiClient.get<ChipPlanResponse[]>(USER_PLANS_BASE);
    return parseWithSchema(z.array(chipPlanResponseSchema), data);
  },

  async getActivePlanById(planId: string): Promise<ChipPlanResponse> {
    const { data } = await apiClient.get<ChipPlanResponse>(`${USER_PLANS_BASE}/${planId}`);
    return parseWithSchema(chipPlanResponseSchema, data);
  },

  // Admin endpoints
  async listAllPlans(): Promise<ChipPlanResponse[]> {
    const { data } = await apiClient.get<ChipPlanResponse[]>(ADMIN_PLANS_BASE);
    return parseWithSchema(z.array(chipPlanResponseSchema), data);
  },

  async getAdminPlanById(planId: string): Promise<ChipPlanResponse> {
    const { data } = await apiClient.get<ChipPlanResponse>(`${ADMIN_PLANS_BASE}/${planId}`);
    return parseWithSchema(chipPlanResponseSchema, data);
  },

  async createPlan(payload: CreateChipPlanRequest): Promise<ChipPlanResponse> {
    const parsedPayload = createChipPlanSchema.parse(payload);
    const { data } = await apiClient.post<ChipPlanResponse>(ADMIN_PLANS_BASE, parsedPayload);
    return parseWithSchema(chipPlanResponseSchema, data);
  },

  async updatePlan(
    planId: string,
    payload: UpdateChipPlanRequest
  ): Promise<ChipPlanResponse> {
    const parsedPayload = updateChipPlanSchema.parse(payload);
    const { data } = await apiClient.put<ChipPlanResponse>(
      `${ADMIN_PLANS_BASE}/${planId}`,
      parsedPayload
    );
    return parseWithSchema(chipPlanResponseSchema, data);
  },

  async deletePlan(planId: string): Promise<void> {
    await apiClient.delete(`${ADMIN_PLANS_BASE}/${planId}`);
  },
};