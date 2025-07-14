import { z } from "zod";

import { parseStringVector } from "../utils";

export const profileSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  username: z.string().min(1),
  displayName: z.string().min(1),
  avatar: z.string().optional().nullable(),
  embedding: z.string().transform(parseStringVector).nullable().optional(),
});
