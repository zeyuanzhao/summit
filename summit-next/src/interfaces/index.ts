import { z } from "zod";

import { eventSchema } from "@/lib/validation/event";
import { listSchema } from "@/lib/validation/list";
import { paperSchema } from "@/lib/validation/paper";

export type Paper = z.infer<typeof paperSchema>;

export type List = z.infer<typeof listSchema>;

export type Event = z.infer<typeof eventSchema>;

export interface PaperUserData {
  paperId: string;
  liked: boolean;
  saved: boolean;
}

export interface FeedStore {
  feed: (Paper & PaperUserData)[];
  currentPage: number;
  initialized: boolean;
  setFeed: (newFeed: (Paper & PaperUserData)[]) => void;
  addToFeed: (newPapers: (Paper & PaperUserData)[]) => void;
  setCurrentPage: (page: number) => void;
  incrementPage: () => void;
  decrementPage: () => void;
  setInitialized: (initialized: boolean) => void;
  like: () => void;
  unlike: () => void;
}

export interface ListStore {
  lists: List[];
  setLists: (newLists: List[]) => void;
  addToLists: (newLists: List[]) => void;
  removeFromLists: (listId: string) => void;
  updateList: (listId: string, updatedList: Partial<List>) => void;
}
