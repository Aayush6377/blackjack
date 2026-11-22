export type RoundStatus =
  | "WAITING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "ABANDONED";

export type HandStatus =
  | "ACTIVE"
  | "STOOD"
  | "BUSTED"
  | "BLACKJACK"
  | "SURRENDERED"
  | "SETTLED";

export type HandOutcome =
  | "BLACKJACK_WIN"
  | "WIN"
  | "PUSH"
  | "LOSS"
  | "BUST"
  | "SURRENDER";

export type InsuranceStatus = "NONE" | "ACCEPTED" | "DECLINED" | "WON" | "LOST";

export type GameActionType =
  | "ROUND_STARTED"
  | "PLAYER_HIT"
  | "PLAYER_STAND"
  | "PLAYER_DOUBLE_DOWN"
  | "PLAYER_SPLIT"
  | "PLAYER_SURRENDERED"
  | "INSURANCE_ACCEPTED"
  | "INSURANCE_DECLINED";

export type ReplayCard =
  | string
  | {
      rank?: string;
      suit?: string;
      code?: string;
      faceUp?: boolean;
      [key: string]: unknown;
    };
    
export interface RoundSummaryResponse {
  roundId: string;
  roomId: string;
  roomName: string;
  originalBet: number;
  totalBet: number;
  totalPayout: number;
  netResult: number;
  status: RoundStatus;
  outcome: HandOutcome | null;
  dealerCards: ReplayCard[];
  dealerTotal: number;
  insuranceBet: number;
  insuranceStatus: InsuranceStatus;
  insurancePayout: number;
  rulesSnapshot: Record<string, unknown>;
  startedAt: string;
  completedAt: string | null;
}

export interface ReplayActionItemResponse {
  actionId: string;
  sequenceNumber: number;
  actionType: GameActionType;
  actionData: Record<string, unknown>;
  handId: string | null;
  handNumber: number | null;
  handCards: ReplayCard[];
  handBetAmount: number | null;
  handValue: number | null;
  handStatus: HandStatus | null;
  handOutcome: HandOutcome | null;
  createdAt: string;
}

export interface ReplayHandSnapshot {
  handId: string;
  handNumber: number;
  cards: ReplayCard[];
  betAmount: number;
  handValue: number;
  status: HandStatus;
  outcome: HandOutcome | null;
}

export interface RoundReplayResponse {
  round: RoundSummaryResponse;
  hands: ReplayHandSnapshot[];
  actions: ReplayActionItemResponse[];
}