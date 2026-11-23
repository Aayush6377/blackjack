import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const imageFileSchema = z
  .custom<File>((val) => typeof File !== "undefined" && val instanceof File)
  .nullable()
  .optional();

export const roomRulesSchema = z.object({
  minWallet: z.number(),
  minBet: z.number(),
  maxBet: z.number(),
  decksPerShoe: z.number(),
  reshuffleThreshold: z.number(),
  blackjackPayout: z.string(),
  dealerHitsSoft17: z.boolean(),
});

export const adminRoomUnlockRuleSchema = z.object({
  id: z.string(),
  prerequisiteRoomId: z.string(),
  prerequisiteRoomName: z.string(),
  prerequisiteRoomSlug: z.string(),
  requiredRounds: z.number(),
  requiredWins: z.number(),
  minimumWallet: z.number(),
});

export const adminGameRoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  difficulty: z.string(),
  backgroundUrl: z.string().nullable(),
  backgroundPublicId: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  thumbnailPublicId: z.string().nullable(),
  active: z.boolean(),
  displayOrder: z.number(),
  rules: roomRulesSchema,
  unlockRules: z.array(adminRoomUnlockRuleSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const adminGameRoomListSchema = z.array(adminGameRoomSchema);

export const createGameRoomFormSchema = z
  .object({
    name: z.string().trim().min(1, "Room name is required").max(100),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(100)
      .regex(slugRegex, "Slug must be lowercase kebab-case (e.g. high-roller-lounge)"),
    description: z.string().nullable().optional(),
    difficulty: z.string().trim().min(1, "Difficulty is required").max(50),
    backgroundUrl: z.string().trim().nullable().optional(),
    backgroundFile: imageFileSchema,
    thumbnailUrl: z.string().trim().nullable().optional(),
    thumbnailFile: imageFileSchema,
    minWallet: z.coerce.number().int().min(0, "Minimum wallet must be 0 or more"),
    minBet: z.coerce.number().int().min(1, "Minimum bet must be at least 1"),
    maxBet: z.coerce.number().int().min(1, "Maximum bet must be at least 1"),
    decksPerShoe: z.coerce.number().int().min(1).max(12),
    reshuffleThreshold: z.coerce.number().min(0.1).max(0.95),
    blackjackPayout: z.string().trim().min(1, "Blackjack payout is required").max(20),
    dealerHitsSoft17: z.boolean(),
    active: z.boolean().optional(),
    displayOrder: z.coerce.number().int().min(0).optional(),
  })
  .refine((data) => data.maxBet >= data.minBet, {
    message: "Max bet must be greater than or equal to min bet",
    path: ["maxBet"],
  })
  .refine(
    (data) =>
      !(
        data.backgroundUrl &&
        data.backgroundUrl.length > 0 &&
        data.backgroundFile
      ),
    {
      message: "Provide either a background URL or a file upload, not both",
      path: ["backgroundFile"],
    }
  )
  .refine(
    (data) =>
      !(
        data.thumbnailUrl &&
        data.thumbnailUrl.length > 0 &&
        data.thumbnailFile
      ),
    {
      message: "Provide either a thumbnail URL or a file upload, not both",
      path: ["thumbnailFile"],
    }
  );

export const updateGameRoomFormSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(slugRegex, "Slug must be lowercase kebab-case")
      .optional(),
    description: z.string().nullable().optional(),
    difficulty: z.string().trim().min(1).max(50).optional(),
    backgroundUrl: z.string().trim().nullable().optional(),
    backgroundFile: imageFileSchema,
    clearBackground: z.boolean().optional(),
    thumbnailUrl: z.string().trim().nullable().optional(),
    thumbnailFile: imageFileSchema,
    clearThumbnail: z.boolean().optional(),
    minWallet: z.coerce.number().int().min(0).optional(),
    minBet: z.coerce.number().int().min(1).optional(),
    maxBet: z.coerce.number().int().min(1).optional(),
    decksPerShoe: z.coerce.number().int().min(1).max(12).optional(),
    reshuffleThreshold: z.coerce.number().min(0.1).max(0.95).optional(),
    blackjackPayout: z.string().trim().min(1).max(20).optional(),
    dealerHitsSoft17: z.boolean().optional(),
    active: z.boolean().optional(),
    displayOrder: z.coerce.number().int().min(0).optional(),
  })
  .refine(
    (data) =>
      data.minBet === undefined ||
      data.maxBet === undefined ||
      data.maxBet >= data.minBet,
    {
      message: "Max bet must be greater than or equal to min bet",
      path: ["maxBet"],
    }
  )
  .refine(
    (data) =>
      !(
        data.backgroundUrl &&
        data.backgroundUrl.length > 0 &&
        data.backgroundFile
      ),
    {
      message: "Provide either a background URL or a file upload, not both",
      path: ["backgroundFile"],
    }
  )
  .refine(
    (data) =>
      !(
        data.thumbnailUrl &&
        data.thumbnailUrl.length > 0 &&
        data.thumbnailFile
      ),
    {
      message: "Provide either a thumbnail URL or a file upload, not both",
      path: ["thumbnailFile"],
    }
  );

export const adminRoomUnlockRuleListSchema = z.array(adminRoomUnlockRuleSchema);

export const updateGameRoomActiveSchema = z.object({
  active: z.boolean(),
});

export const createRoomUnlockRuleFormSchema = z.object({
  prerequisiteRoomId: z.string().trim().min(1, "Prerequisite room is required"),
  requiredRounds: z.coerce
    .number()
    .int()
    .min(0, "Required rounds must be 0 or more"),
  requiredWins: z.coerce
    .number()
    .int()
    .min(0, "Required wins must be 0 or more"),
  minimumWallet: z.coerce
    .number()
    .int()
    .min(0, "Minimum wallet must be 0 or more"),
});

export const updateRoomUnlockRuleFormSchema = z.object({
  prerequisiteRoomId: z.string().trim().min(1).optional(),
  requiredRounds: z.coerce.number().int().min(0).optional(),
  requiredWins: z.coerce.number().int().min(0).optional(),
  minimumWallet: z.coerce.number().int().min(0).optional(),
});