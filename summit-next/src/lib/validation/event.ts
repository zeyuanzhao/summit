import { z } from "zod";

export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  paperId: z.string().uuid(),
  eventType: z.enum(["like", "unlike", "save", "unsave", "read"]),
  payload: z.record(z.any()).optional(),
  createdAt: z.coerce.date().optional(),
});
