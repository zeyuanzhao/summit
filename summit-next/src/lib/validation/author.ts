import { z } from "zod";

export const authorSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date().optional(),
  name: z
    .string()
    .min(1, { message: "Author name must be at least 1 character" }),
});
