import { z } from "zod";

export const tagSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date().optional(),
  name: z.string().min(1, { message: "Tag name must be at least 1 character" }),
});
