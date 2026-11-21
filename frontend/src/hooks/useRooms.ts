import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gameService } from "../services/gameService";
import { roomService } from "../services/roomService";

export const roomKeys = {
  all: ["rooms"] as const,
  detail: (roomId: string) => ["rooms", roomId] as const,
};

export const gameKeys = {
  active: ["games", "active"] as const,
};

export function useRooms() {
  return useQuery({
    queryKey: roomKeys.all,
    queryFn: roomService.getAllRooms,
    staleTime: 15_000,
  });
}

export function useRoom(roomId: string | null | undefined) {
  return useQuery({
    queryKey: roomKeys.detail(roomId ?? ""),
    queryFn: () => roomService.getRoomById(roomId!),
    enabled: Boolean(roomId),
  });
}

export function useActiveGame() {
  return useQuery({
    queryKey: gameKeys.active,
    queryFn: gameService.getActiveGame,
    staleTime: 0,
  });
}

export function useLeaveGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => gameService.leaveGame(gameId),
    onSuccess: () => {
      queryClient.setQueryData(gameKeys.active, null);
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}