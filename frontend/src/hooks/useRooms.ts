import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gameService } from "../services/gameService";
import { roomService } from "../services/roomService";
import type { AdminGameRoom, CreateGameRoomPayload, CreateRoomUnlockRulePayload, UpdateGameRoomActivePayload, 
  UpdateGameRoomPayload, UpdateRoomUnlockRulePayload } from "../types/room";

export const roomKeys = {
  all: ["rooms"] as const,
  detail: (roomId: string) => ["rooms", roomId] as const,
  userList: () => [...roomKeys.all, "user", "list"] as const,
  userDetail: (roomIdOrSlug: string) => [...roomKeys.all, "user", "detail", roomIdOrSlug] as const,
  adminList: () => [...roomKeys.all, "admin", "list"] as const,
  adminDetail: (roomId: string) => [...roomKeys.all, "admin", "detail", roomId] as const,
  unlockRules: (roomId: string) => [...roomKeys.all, "admin", "unlock-rules", roomId] as const,
  unlockRuleDetail: (roomId: string, ruleId: string) => [...roomKeys.all, "admin", "unlock-rules", roomId, ruleId] as const,
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

export function useAdminRooms() {
  return useQuery({
    queryKey: roomKeys.adminList(),
    queryFn: () => roomService.getAdminRooms(),
  });
}

export function useAdminRoom(roomId: string | undefined) {
  return useQuery({
    queryKey: roomKeys.adminDetail(roomId ?? ""),
    queryFn: () => roomService.getAdminRoomById(roomId!),
    enabled: Boolean(roomId),
  });
}

export function useCreateAdminRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGameRoomPayload) => roomService.createAdminRoom(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useUpdateAdminRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, payload }: { roomId: string; payload: UpdateGameRoomPayload }) => 
      roomService.updateAdminRoom(roomId, payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
      queryClient.setQueryData(roomKeys.adminDetail(updated.id), updated);
    },
  });
}

export function useToggleAdminRoomActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, payload }: { roomId: string; payload: UpdateGameRoomActivePayload }) => 
      roomService.updateAdminRoomActive(roomId, payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
      queryClient.setQueryData(roomKeys.adminDetail(updated.id), updated);
    },
  });
}

export function useDeleteAdminRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => roomService.deleteAdminRoom(roomId),
    onSuccess: (_data, deletedRoomId) => {
      queryClient.setQueryData<AdminGameRoom[]>(
        roomKeys.adminList(),
        (prev) =>
          (prev ?? [])
            .filter((r) => r.id !== deletedRoomId)
            .map((r) => ({
              ...r,
              unlockRules: r.unlockRules.filter( (rule) => rule.prerequisiteRoomId !== deletedRoomId),
            }))
      );

      queryClient.removeQueries({
        queryKey: roomKeys.adminDetail(deletedRoomId),
      });

      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useAdminRoomUnlockRules(roomId: string | undefined) {
  return useQuery({
    queryKey: roomKeys.unlockRules(roomId ?? ""),
    queryFn: () => roomService.getRoomUnlockRules(roomId!),
    enabled: Boolean(roomId),
  });
}

export function useCreateRoomUnlockRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, payload }: { roomId: string; payload: CreateRoomUnlockRulePayload; }) => 
      roomService.createRoomUnlockRule(roomId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: roomKeys.unlockRules(variables.roomId),
      });
      void queryClient.invalidateQueries({
        queryKey: roomKeys.adminDetail(variables.roomId),
      });
      void queryClient.invalidateQueries({ queryKey: roomKeys.adminList() });
      void queryClient.invalidateQueries({ queryKey: roomKeys.userList() });
    },
  });
}

export function useUpdateRoomUnlockRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, ruleId, payload }: { roomId: string; ruleId: string; payload: UpdateRoomUnlockRulePayload }) => 
      roomService.updateRoomUnlockRule(roomId, ruleId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: roomKeys.unlockRules(variables.roomId),
      });
      void queryClient.invalidateQueries({
        queryKey: roomKeys.adminDetail(variables.roomId),
      });
      void queryClient.invalidateQueries({ queryKey: roomKeys.adminList() });
      void queryClient.invalidateQueries({ queryKey: roomKeys.userList() });
    },
  });
}

export function useDeleteRoomUnlockRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, ruleId }: { roomId: string; ruleId: string }) => 
      roomService.deleteRoomUnlockRule(roomId, ruleId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: roomKeys.unlockRules(variables.roomId),
      });
      void queryClient.invalidateQueries({
        queryKey: roomKeys.adminDetail(variables.roomId),
      });
      void queryClient.invalidateQueries({ queryKey: roomKeys.adminList() });
      void queryClient.invalidateQueries({ queryKey: roomKeys.userList() });
    },
  });
}