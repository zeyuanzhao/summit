import { z } from "zod";

export const listPaperSchema = z.object({
  listId: z.string().uuid(),
  paperId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.coerce.date().optional(),
});
