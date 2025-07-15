import { z } from "zod";

import { authorSchema } from "./author";
import { paperSchema } from "./paper";
import { tagSchema } from "./tag";

export const paperDetailSchema = z
  .object({
    authors: z.array(authorSchema).optional(),
    tags: z.array(tagSchema).optional(),
  })
  .merge(paperSchema);
