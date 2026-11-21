import { apiClient } from "../lib/apiClient";
import type { GameStateSnapshot } from "../types/game";
import { extractBackendMessage } from "../utils/apiError";

export interface LeaveGameResponse {
  message: string;
  gameState: GameStateSnapshot;
}

export const gameService = {
  async getActiveGame(): Promise<GameStateSnapshot | null> {
    try {
      const response = await apiClient.get<GameStateSnapshot>("/games/active", {
        validateStatus: (status) => status === 200 || status === 204,
      });
      if (response.status === 204 || !response.data) {
        return null;
      }
      return response.data;
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to check active game"));
    }
  },

  async leaveGame(gameId: string): Promise<LeaveGameResponse> {
    try {
      const { data } = await apiClient.post<LeaveGameResponse>(`/games/${gameId}/leave`);
      return data;
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to leave game"));
    }
  },
};