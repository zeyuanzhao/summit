import { z } from "zod";

export const listSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.coerce.date().optional(),
  title: z.string().min(1),
  user_id: z.string().uuid(),
  description: z.string().nullable().optional(),
});
