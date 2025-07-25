import { z } from "zod";

import { eventSchema } from "@/lib/validation/event";
import { listSchema } from "@/lib/validation/list";
import { paperSchema } from "@/lib/validation/paper";
import { paperDetailSchema } from "@/lib/validation/paperDetail";
import { profileSchema } from "@/lib/validation/profile";
import { tagSchema } from "@/lib/validation/tag";

export type Paper = z.infer<typeof paperSchema>;

export type List = z.infer<typeof listSchema>;

export type Event = z.infer<typeof eventSchema>;

export type Profile = z.infer<typeof profileSchema>;

export type PaperDetail = z.infer<typeof paperDetailSchema>;

export type Tag = z.infer<typeof tagSchema>;

export interface PaperUserData {
  liked: boolean;
  lists: string[];
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
  toggleSavePaper: (listId: string) => void;
  fetchInitialFeed: (limit?: number, id?: string) => Promise<void>;
  fetchMoreFeed: (limit?: number) => Promise<void>;
  likePaper: () => Promise<void>;
  savePaper: (listId: string) => Promise<void>;
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

export interface ProfileStore {
  profile: Profile | null;
  initialized: boolean;
  setProfile: (profile: Profile | null) => void;
  setInitialized: (initialized: boolean) => void;
  fetchProfile: () => Promise<void>;
}
