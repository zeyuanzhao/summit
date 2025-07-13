import { z } from "zod";

import { parseStringVector } from "../utils";

export const paperSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  title: z.string().min(1),
  canonicalId: z.string().min(1),
  abstract: z.string().nullable().optional(),
  publishedDate: z.coerce.date().nullable().optional(),
  venue: z.string().nullable().optional(),
  url: z.string().url().nullable().optional(),
  summary: z.string().nullable().optional(),
  embedding: z.string().transform(parseStringVector).nullable().optional(),
});
