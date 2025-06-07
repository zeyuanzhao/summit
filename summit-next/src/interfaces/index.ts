import { z } from "zod";

import { listSchema } from "@/lib/validation/list";
import { paperSchema } from "@/lib/validation/paper";

export type Paper = z.infer<typeof paperSchema>;

export type List = z.infer<typeof listSchema>;

export interface FeedStore {
  feed: Paper[];
  currentPage: number;
  initialized: boolean;
  setFeed: (newFeed: Paper[]) => void;
  addToFeed: (newPapers: Paper[]) => void;
  setCurrentPage: (page: number) => void;
  incrementPage: () => void;
  decrementPage: () => void;
  setInitialized: (initialized: boolean) => void;
}
