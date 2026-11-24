import type z from "zod";
import { apiClient } from "../lib/apiClient";
import type { AdminGameRoom, AdminRoomUnlockRule, CreateGameRoomPayload, CreateRoomUnlockRulePayload, 
  RoomSummary, UpdateGameRoomActivePayload, UpdateGameRoomPayload, UpdateRoomUnlockRulePayload } from "../types/room";
import { extractBackendMessage } from "../utils/apiError";
import { adminGameRoomListSchema, adminGameRoomSchema, adminRoomUnlockRuleListSchema, 
  adminRoomUnlockRuleSchema, updateGameRoomActiveSchema } from "../schema/room.schema";

const ADMIN_ROOMS_BASE = "/admin/rooms";

function parseRoomPayload<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.warn("Room API schema mismatch:", parsed.error.flatten());
    return raw as T;
  }
  return parsed.data;
}

function toRoomFormData(payload: CreateGameRoomPayload | UpdateGameRoomPayload): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof File !== "undefined" && value instanceof File) {
      formData.append(key, value);
      return;
    }
    formData.append(key, String(value));
  });

  return formData;
}

export const roomService = {
  async getAllRooms(): Promise<RoomSummary[]> {
    try {
      const { data } = await apiClient.get<RoomSummary[]>("/rooms");
      return data;
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load game rooms"));
    }
  },

  async getRoomById(roomId: string): Promise<RoomSummary> {
    try {
      const { data } = await apiClient.get<RoomSummary>(`/rooms/${roomId}`);
      return data;
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load room details"));
    }
  },

  async getAdminRooms(): Promise<AdminGameRoom[]> {
    try {
      const { data } = await apiClient.get<AdminGameRoom[]>(ADMIN_ROOMS_BASE);
      return parseRoomPayload(adminGameRoomListSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load admin game rooms"));
    }
  },

  async getAdminRoomById(roomId: string): Promise<AdminGameRoom> {
    try {
      const { data } = await apiClient.get<AdminGameRoom>(`${ADMIN_ROOMS_BASE}/${roomId}`);
      return parseRoomPayload(adminGameRoomSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load admin room details"));
    }
  },

  async createAdminRoom(payload: CreateGameRoomPayload): Promise<AdminGameRoom> {
    try {
      const formData = toRoomFormData(payload);
      const { data } = await apiClient.post<AdminGameRoom>(ADMIN_ROOMS_BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return parseRoomPayload(adminGameRoomSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to create game room"));
    }
  },

  async updateAdminRoom(roomId: string, payload: UpdateGameRoomPayload): Promise<AdminGameRoom> {
    try {
      const formData = toRoomFormData(payload);
      const { data } = await apiClient.put<AdminGameRoom>(`${ADMIN_ROOMS_BASE}/${roomId}`, formData, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      return parseRoomPayload(adminGameRoomSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to update game room"));
    }
  },

  async updateAdminRoomActive(roomId: string, payload: UpdateGameRoomActivePayload): Promise<AdminGameRoom> {
    try {
      const validated = updateGameRoomActiveSchema.parse(payload);
      const { data } = await apiClient.patch<AdminGameRoom>(`${ADMIN_ROOMS_BASE}/${roomId}/active`, validated );
      return parseRoomPayload(adminGameRoomSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to update game room status"));
    }
  },

  async deleteAdminRoom(roomId: string): Promise<void> {
    try {
      await apiClient.delete(`${ADMIN_ROOMS_BASE}/${roomId}`);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to delete game room"));
    }
  },

  async getRoomUnlockRules(roomId: string): Promise<AdminRoomUnlockRule[]> {
    try {
      const { data } = await apiClient.get<AdminRoomUnlockRule[]>(
        `${ADMIN_ROOMS_BASE}/${roomId}/unlock-rules`
      );
      return parseRoomPayload(adminRoomUnlockRuleListSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load room unlock rules"));
    }
  },

  async getRoomUnlockRuleById( roomId: string, ruleId: string ): Promise<AdminRoomUnlockRule> {
    try {
      const { data } = await apiClient.get<AdminRoomUnlockRule>(
        `${ADMIN_ROOMS_BASE}/${roomId}/unlock-rules/${ruleId}`
      );
      return parseRoomPayload(adminRoomUnlockRuleSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load unlock rule details"));
    }
  },

  async createRoomUnlockRule(roomId: string, payload: CreateRoomUnlockRulePayload): Promise<AdminRoomUnlockRule> {
    try {
      const { data } = await apiClient.post<AdminRoomUnlockRule>(
        `${ADMIN_ROOMS_BASE}/${roomId}/unlock-rules`,
        payload
      );
      return parseRoomPayload(adminRoomUnlockRuleSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to create room unlock rule"));
    }
  },

  async updateRoomUnlockRule(roomId: string, ruleId: string, payload: UpdateRoomUnlockRulePayload): Promise<AdminRoomUnlockRule> {
    try {
      const { data } = await apiClient.put<AdminRoomUnlockRule>(
        `${ADMIN_ROOMS_BASE}/${roomId}/unlock-rules/${ruleId}`,
        payload
      );
      return parseRoomPayload(adminRoomUnlockRuleSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to update room unlock rule"));
    }
  },

  async deleteRoomUnlockRule(roomId: string, ruleId: string): Promise<void> {
    try {
      await apiClient.delete(`${ADMIN_ROOMS_BASE}/${roomId}/unlock-rules/${ruleId}`);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to delete room unlock rule"));
    }
  },
};