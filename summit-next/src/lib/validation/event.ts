import { z } from "zod";

export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  paper_id: z.string().uuid(),
  event_type: z.enum(["like", "unlike", "save", "unsave", "read"]),
  payload: z.record(z.any()).optional(),
  created_at: z.string().datetime().optional(),
});
