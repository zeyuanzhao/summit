import { z } from "zod";

export const paperMatchSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  similarity: z.number(),
});
