import { z } from "zod";

import { eventSchema } from "@/lib/validation/event";
import { listSchema } from "@/lib/validation/list";
import { paperSchema } from "@/lib/validation/paper";

export type Paper = z.infer<typeof paperSchema>;

export type List = z.infer<typeof listSchema>;

export type Event = z.infer<typeof eventSchema>;

export interface PaperUserData {
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
  toggleLikePaper: () => void;
  fetchInitialFeed: (limit?: number, id?: string) => Promise<void>;
  fetchMoreFeed: (limit?: number) => Promise<void>;
  likePaper: (userId: string | null) => Promise<void>;
}

export interface ListStore {
  lists: List[];
  initialized: boolean;
  setInitialized: (initialized: boolean) => void;
  setLists: (newLists: List[]) => void;
  addToLists: (newLists: List[]) => void;
  removeFromLists: (listId: string) => void;
  updateList: (listId: string, updatedList: Partial<List>) => void;
  getLists: (userId: string | null) => Promise<List[]>;
  fetchLists: (userId: string | null) => Promise<void>;
}
