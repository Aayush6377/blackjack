import { z } from "zod";

export const adminAuditLogFilterSchema = z.object({
  adminId: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const adminAuditLogResponseSchema = z.object({
  id: z.string(),
  adminId: z.string().nullable().optional().transform((val) => val ?? null),
  adminUsername: z.string().nullable().optional().transform((val) => val ?? null),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  oldValues: z.record(z.string(), z.unknown()).default({}),
  newValues: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string(),
});

export function createPageResponseSchema<TItem>(itemSchema: z.ZodType<TItem>) {
  return z.object({
    items: z.array(itemSchema),
    page: z.number(),
    limit: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
    first: z.boolean(),
    last: z.boolean(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  });
}

export const adminAuditLogPageResponseSchema = createPageResponseSchema(
  adminAuditLogResponseSchema
);