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

export interface AdminRoomUnlockRule {
  id: string;
  prerequisiteRoomId: string;
  prerequisiteRoomName: string;
  prerequisiteRoomSlug: string;
  requiredRounds: number;
  requiredWins: number;
  minimumWallet: number;
}

export interface AdminGameRoom {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  difficulty: string;
  backgroundUrl: string | null;
  backgroundPublicId: string | null;
  thumbnailUrl: string | null;
  thumbnailPublicId: string | null;
  active: boolean;
  displayOrder: number;
  rules: RoomRules;
  unlockRules: AdminRoomUnlockRule[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameRoomPayload {
  name: string;
  slug: string;
  description?: string | null;
  difficulty: string;
  backgroundUrl?: string | null;
  backgroundFile?: File | null;
  thumbnailUrl?: string | null;
  thumbnailFile?: File | null;
  minWallet: number;
  minBet: number;
  maxBet: number;
  decksPerShoe: number;
  reshuffleThreshold: number;
  blackjackPayout: string;
  dealerHitsSoft17: boolean;
  active?: boolean;
  displayOrder?: number;
}

export interface UpdateGameRoomPayload {
  name?: string;
  slug?: string;
  description?: string | null;
  difficulty?: string;
  backgroundUrl?: string | null;
  backgroundFile?: File | null;
  clearBackground?: boolean;
  thumbnailUrl?: string | null;
  thumbnailFile?: File | null;
  clearThumbnail?: boolean;
  minWallet?: number;
  minBet?: number;
  maxBet?: number;
  decksPerShoe?: number;
  reshuffleThreshold?: number;
  blackjackPayout?: string;
  dealerHitsSoft17?: boolean;
  active?: boolean;
  displayOrder?: number;
}

export interface UpdateGameRoomActivePayload {
  active: boolean;
}

export interface CreateRoomUnlockRulePayload {
  prerequisiteRoomId: string;
  requiredRounds: number;
  requiredWins: number;
  minimumWallet: number;
}

export interface UpdateRoomUnlockRulePayload {
  prerequisiteRoomId?: string;
  requiredRounds?: number;
  requiredWins?: number;
  minimumWallet?: number;
}