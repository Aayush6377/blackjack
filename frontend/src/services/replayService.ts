import { z } from "zod";
import { apiClient } from "../lib/apiClient";
import { replayActionItemResponseSchema, roundReplayResponseSchema, roundSummaryPageResponseSchema } from "../schema/replay.schema";
import type { ReplayActionItemResponse, RoundReplayResponse, RoundSummaryResponse } from "../types/replay";
import type { PageQueryParams, PageResponse } from "../types/page";

const REPLAY_BASE = "/replays";

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn("Replay API payload schema mismatch:", result.error.flatten());
    return data as T;
  }
  return result.data;
}

export const replayService = {
  async getRoundsPage( params: PageQueryParams = {} ): Promise<PageResponse<RoundSummaryResponse>> {
    const queryParams: Record<string, string | number> = {
      page: params.page ?? 0,
      limit: params.limit ?? 10,
      orderBy: params.orderBy ?? "startedAt",
      direction: params.direction ?? "DESC",
    };

    if (params.search && params.search.trim().length > 0) {
      queryParams.search = params.search.trim();
    }

    const { data } = await apiClient.get<PageResponse<RoundSummaryResponse>>(
      `${REPLAY_BASE}/rounds`,
      { params: queryParams }
    );

    return parseWithSchema(roundSummaryPageResponseSchema, data);
  },

  async getRoundReplay(roundId: string): Promise<RoundReplayResponse> {
    const { data } = await apiClient.get<RoundReplayResponse>(
      `${REPLAY_BASE}/rounds/${roundId}`
    );
    return parseWithSchema(roundReplayResponseSchema, data);
  },

  async getRoundActions(roundId: string): Promise<ReplayActionItemResponse[]> {
    const { data } = await apiClient.get<ReplayActionItemResponse[]>(
      `${REPLAY_BASE}/rounds/${roundId}/actions`
    );
    return parseWithSchema(z.array(replayActionItemResponseSchema), data);
  },
};