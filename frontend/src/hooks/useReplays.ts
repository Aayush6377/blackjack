import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { replayService } from "../services/replayService";
import type { PageQueryParams } from "../types/page";

export const replayKeys = {
  all: ["replays"] as const,
  rounds: (params: PageQueryParams) =>
    [
      ...replayKeys.all,
      "rounds",
      params.page ?? 0,
      params.limit ?? 10,
      params.orderBy ?? "startedAt",
      params.direction ?? "DESC",
      params.search ?? "",
    ] as const,
  detail: (roundId: string) => [...replayKeys.all, "detail", roundId] as const,
  actions: (roundId: string) => [...replayKeys.all, "actions", roundId] as const,
};

export function useReplayRounds(params: PageQueryParams = {}) {
  return useQuery({
    queryKey: replayKeys.rounds(params),
    queryFn: () => replayService.getRoundsPage(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useRoundReplay(roundId: string | undefined) {
  return useQuery({
    queryKey: replayKeys.detail(roundId ?? ""),
    queryFn: () => replayService.getRoundReplay(roundId!),
    enabled: Boolean(roundId),
    staleTime: 60_000,
  });
}

export function useRoundActions(roundId: string | undefined) {
  return useQuery({
    queryKey: replayKeys.actions(roundId ?? ""),
    queryFn: () => replayService.getRoundActions(roundId!),
    enabled: Boolean(roundId),
    staleTime: 60_000,
  });
}