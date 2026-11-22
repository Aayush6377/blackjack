import z from "zod";

export const pageQueryParamsSchema = z.object({
  page: z.number().int().min(0).optional().default(0),
  limit: z.number().int().min(1).max(100).optional().default(10),
  orderBy: z.string().optional(),
  direction: z.enum(["ASC", "DESC"]).optional().default("DESC"),
  search: z.string().optional().default(""),
});

export function createPageResponseSchema<ItemSchema extends z.ZodTypeAny>(itemSchema: ItemSchema) {
  return z.object({
    items: z.array(itemSchema),
    page: z.number().int().min(0),
    limit: z.number().int().min(1),
    totalElements: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    first: z.boolean(),
    last: z.boolean(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  });
}
