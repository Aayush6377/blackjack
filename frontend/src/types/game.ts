export type RoundStatus =
  | "WAITING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "ABANDONED";

export type ConnectionStatus = "CONNECTED" | "DISCONNECTED";

export type InsuranceStatus = "NONE" | "ACCEPTED" | "DECLINED" | "WON" | "LOST";

export type HandStatus =
  | "ACTIVE"
  | "STOOD"
  | "BUSTED"
  | "BLACKJACK"
  | "SURRENDERED"
  | "SETTLED";

export type HandOutcome =
  | "WIN"
  | "LOSS"
  | "PUSH"
  | "BLACKJACK_WIN"
  | "SURRENDER"
  | "BUST"
  | null;

export type PlayerActionType =
  | "HIT"
  | "STAND"
  | "DOUBLE_DOWN"
  | "SPLIT"
  | "SURRENDER";

export type CardCode = string;

export interface HandSnapshot {
  handId: string;
  handNumber: number;
  cards: CardCode[];
  betAmount: number;
  handValue: number;
  status: HandStatus;
  outcome: HandOutcome;
}

export interface GameStateSnapshot {
  roundId: string;
  roomId: string;
  roomName: string;
  roundStatus: RoundStatus;
  connectionStatus: ConnectionStatus;
  controllerTab: boolean;
  walletBalance: number;
  originalBet: number;
  totalBet: number;
  totalPayout: number;
  netResult: number;
  dealerCards: CardCode[];
  dealerTotal: number;
  insuranceAvailable: boolean;
  insuranceBet: number;
  insuranceStatus: InsuranceStatus;
  insurancePayout: number;
  roundOutcome: HandOutcome;
  hands: HandSnapshot[];
}

export interface StartRoundRequest {
  roomId: string;
  betAmount: number;
  idempotencyKey: string;
}

export interface InsuranceCommand {
  roundId: string;
  accept: boolean;
  idempotencyKey: string;
}

export interface GameActionCommand {
  roundId: string;
  handId?: string | null;
  action: PlayerActionType;
  idempotencyKey: string;
}

export interface GameErrorPayload {
  error: string;
  message: string;
}

export interface GameEventPayload {
  type: string;
  roundId?: string;
  sessionId?: string;
  message?: string;
}