export interface RoomRules {
  minWallet: number;
  minBet: number;
  maxBet: number;
  decksPerShoe: number;
  reshuffleThreshold: number;
  blackjackPayout: string;
  dealerHitsSoft17: boolean;
}

export interface RoomProgress {
  roundsPlayed: number;
  roundsWon: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface UnlockRequirement {
  prerequisiteRoomId: string;
  prerequisiteRoomName: string;
  prerequisiteRoomSlug: string;
  requiredRounds: number;
  requiredWins: number;
  minimumWallet: number;
  met: boolean;
}

export interface RoomSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  difficulty: string;
  backgroundUrl: string | null;
  thumbnailUrl: string | null;
  displayOrder: number;
  unlocked: boolean;
  eligibleToPlay: boolean;
  rules: RoomRules;
  progress: RoomProgress;
  unlockRequirements: UnlockRequirement[];
}