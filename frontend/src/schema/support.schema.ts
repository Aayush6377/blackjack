import { z } from "zod";

export const ticketCategorySchema = z.enum([
  "PAYMENT_OR_CHIPS",
  "GAMEPLAY_OR_ROOM",
  "ACCOUNT",
  "BUG_REPORT",
  "OTHER",
]);

export const ticketStatusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

export const sortDirectionSchema = z.enum(["ASC", "DESC"]);

export const supportTicketFilterSchema = z.object({
  status: ticketStatusSchema.nullable().optional(),
  category: ticketCategorySchema.nullable().optional(),
});

export const createSupportTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(160, "Subject must be at most 160 characters"),
  category: ticketCategorySchema,
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(5000, "Message must be at most 5000 characters"),
});

export const resolveSupportTicketSchema = z.object({
  status: ticketStatusSchema,
  adminResolution: z
    .string()
    .trim()
    .min(1, "Resolution message is required")
    .max(5000, "Resolution must be at most 5000 characters"),
});

export const supportTicketResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  subject: z.string(),
  category: ticketCategorySchema,
  message: z.string(),
  status: ticketStatusSchema,
  adminResolution: z.string().nullable().optional().transform((v) => v ?? null),
  resolvedByAdminId: z.string().nullable().optional().transform((v) => v ?? null),
  resolvedByAdminName: z.string().nullable().optional().transform((v) => v ?? null),
  resolvedAt: z.string().nullable().optional().transform((v) => v ?? null),
  createdAt: z.string().nullable().optional().transform((v) => v ?? null),
  updatedAt: z.string().nullable().optional().transform((v) => v ?? null),
});

export const createPageResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    page: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    first: z.boolean(),
    last: z.boolean(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  });

export const supportTicketPageResponseSchema = createPageResponseSchema(
  supportTicketResponseSchema
);

export type CreateSupportTicketFormValues = z.infer<typeof createSupportTicketSchema>;
export type ResolveSupportTicketFormValues = z.infer<typeof resolveSupportTicketSchema>;