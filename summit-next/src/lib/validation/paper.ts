import { z } from "zod";

export const paperSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  title: z.string().min(1),
  canonical_id: z.string().min(1),
  abstract: z.string().nullable().optional(),
  published_date: z.coerce.date().nullable().optional(),
  venue: z.string().nullable().optional(),
  url: z.string().url().nullable().optional(),
});
