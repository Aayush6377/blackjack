import { apiClient } from "../lib/apiClient";
import type { RoomSummary } from "../types/room";
import { extractBackendMessage } from "../utils/apiError";

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
};