import { z } from "zod";

export const listSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  title: z.string().min(1),
  userId: z.string().uuid(),
  description: z.string().nullable().optional(),
});
