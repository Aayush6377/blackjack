import { z } from "zod";
import { createPageResponseSchema, pageQueryParamsSchema } from "./page.schema";

export const roundStatusSchema = z.enum([
  "WAITING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "ABANDONED",
]);

export const handStatusSchema = z.enum([
  "ACTIVE",
  "STOOD",
  "BUSTED",
  "BLACKJACK",
  "SURRENDERED",
  "SETTLED",
]);

export const handOutcomeSchema = z.enum([
  "BLACKJACK_WIN",
  "WIN",
  "PUSH",
  "LOSS",
  "BUST",
  "SURRENDER",
]);

export const insuranceStatusSchema = z.enum([
  "NONE",
  "ACCEPTED",
  "DECLINED",
  "WON",
  "LOST",
]);

export const gameActionTypeSchema = z.enum([
  "ROUND_STARTED",
  "PLAYER_HIT",
  "PLAYER_STAND",
  "PLAYER_DOUBLE_DOWN",
  "PLAYER_SPLIT",
  "PLAYER_SURRENDERED",
  "INSURANCE_ACCEPTED",
  "INSURANCE_DECLINED",
]);

export const replayCardSchema = z.record(z.string(), z.unknown());

export const roundSummaryResponseSchema = z.object({
  roundId: z.string().min(1),
  roomId: z.string().min(1),
  roomName: z.string(),
  originalBet: z.number(),
  totalBet: z.number(),
  totalPayout: z.number(),
  netResult: z.number(),
  status: roundStatusSchema,
  outcome: handOutcomeSchema.nullable(),
  dealerCards: z.array(replayCardSchema),
  dealerTotal: z.number().int(),
  insuranceBet: z.number(),
  insuranceStatus: insuranceStatusSchema,
  insurancePayout: z.number(),
  rulesSnapshot: z.record(z.string(), z.unknown()),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
});

export const roundSummaryPageResponseSchema = createPageResponseSchema(
  roundSummaryResponseSchema
);

export const replayActionItemResponseSchema = z.object({
  actionId: z.string().min(1),
  sequenceNumber: z.number().int().min(1),
  actionType: gameActionTypeSchema,
  actionData: z.record(z.string(), z.unknown()),
  handId: z.string().nullable(),
  handNumber: z.number().int().nullable(),
  handCards: z.array(replayCardSchema),
  handBetAmount: z.number().nullable(),
  handValue: z.number().int().nullable(),
  handStatus: handStatusSchema.nullable(),
  handOutcome: handOutcomeSchema.nullable(),
  createdAt: z.string(),
});

export const replayHandSnapshotSchema = z.object({
  handId: z.string().min(1),
  handNumber: z.number().int().min(1),
  cards: z.array(replayCardSchema),
  betAmount: z.number(),
  handValue: z.number().int(),
  status: handStatusSchema,
  outcome: handOutcomeSchema.nullable(),
});

export const roundReplayResponseSchema = z.object({
  round: roundSummaryResponseSchema,
  hands: z.array(replayHandSnapshotSchema),
  actions: z.array(replayActionItemResponseSchema),
});

export type PageQueryFormValues = z.infer<typeof pageQueryParamsSchema>;