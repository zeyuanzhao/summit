import snakecaseKeys from "snakecase-keys";
import { toast } from "sonner";
import { create } from "zustand";

import { FeedStore, Paper, PaperUserData } from "@/interfaces";
import { createClient } from "@/lib/supabase/client";
import { eventSchema } from "@/lib/validation/event";

export const useFeedStore = create<FeedStore>()((set, get) => ({
  feed: [],
  currentPage: 0,
  initialized: false,
  setFeed: (newFeed: (Paper & PaperUserData)[]) => set({ feed: newFeed }),
  addToFeed: (newPapers: (Paper & PaperUserData)[]) => {
    const currentFeed = get().feed;
    set({ feed: [...currentFeed, ...newPapers] });
  },
  setCurrentPage: (page: number) => set({ currentPage: page }),
  incrementPage: () => set((state) => ({ currentPage: state.currentPage + 1 })),
  decrementPage: () =>
    set((state) => ({ currentPage: Math.max(0, state.currentPage - 1) })),
  setInitialized: (initialized: boolean) =>
    set((state) => ({ ...state, initialized })),
  toggleLikePaper: () => {
    set((state) => {
      const updatedFeed = [...state.feed];
      if (updatedFeed[state.currentPage]) {
        updatedFeed[state.currentPage] = {
          ...updatedFeed[state.currentPage],
          liked: !updatedFeed[state.currentPage].liked,
        };
      }
      return { feed: updatedFeed };
    });
  },
  toggleSavePaper: (listId: string) => {
    set((state) => {
      const updatedFeed = [...state.feed];
      if (updatedFeed[state.currentPage]) {
        const currentPaper = updatedFeed[state.currentPage];
        const lists = currentPaper.lists.includes(listId)
          ? currentPaper.lists.filter((id) => id !== listId)
          : [...currentPaper.lists, listId];
        updatedFeed[state.currentPage] = {
          ...currentPaper,
          lists,
        };
      }
      return { feed: updatedFeed };
    });
  },
  fetchInitialFeed: async (limit = 4, id = "") => {
    if (get().initialized) return;
    try {
      const url = new URL("/feed/fetch", window.location.origin);
      url.searchParams.append("limit", limit.toString());
      if (id) {
        url.searchParams.append("ids", id);
      }
      const res = await fetch(url.toString());
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch feed");
      }
      const data = await res.json();
      set({ feed: data });
      set({ initialized: true });
    } catch (error) {
      toast.error((error as Error).message || "Failed to fetch feed");
    }
  },
  fetchMoreFeed: async (limit = 4) => {
    try {
      const url = new URL("/feed/fetch", window.location.origin);
      url.searchParams.append("limit", limit.toString());
      const res = await fetch(url.toString());
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch more feed");
      }
      const data = await res.json();
      const currentFeed = get().feed;
      set({ feed: [...currentFeed, ...data] });
    } catch (error) {
      toast.error((error as Error).message || "Failed to fetch more feed");
    }
  },
  likePaper: async (userId: string | null) => {
    const { currentPage, feed } = get();
    const paper = feed[currentPage];
    if (!userId) {
      toast.error("You must be logged in to like papers.");
      return;
    }
    if (!paper?.id) {
      toast.error("Invalid paper ID.");
      return;
    }
    const eventType = paper.liked ? "unlike" : "like";
    const parsed = eventSchema.safeParse({
      userId,
      paperId: paper.id,
      eventType,
      payload: {},
    });
    if (!parsed.success) {
      toast.error(
        `There was an error ${eventType === "like" ? "liking" : "unliking"} the paper.`,
      );
      return;
    }
    const supabase = createClient();
    const { error } = await supabase
      .from("event")
      .insert(snakecaseKeys(parsed.data));
    if (error) {
      toast.error(
        `There was an error ${eventType === "like" ? "liking" : "unliking"} the paper.`,
      );
      return;
    }
    get().toggleLikePaper();
  },
  savePaper: async (userId: string | null, listId: string) => {
    const { currentPage, feed } = get();
    const paper = feed[currentPage];
    if (!userId) {
      toast.error("You must be logged in to save papers.");
      return;
    }
    if (!paper?.id) {
      toast.error("Invalid paper ID.");
      return;
    }
    const eventType = paper.lists.includes(listId) ? "unsave" : "save";
    const parsed = eventSchema.safeParse({
      userId,
      paperId: paper.id,
      eventType,
      payload: {
        listId,
      },
    });
    if (!parsed.success) {
      toast.error(
        `There was an error ${eventType === "save" ? "saving" : "unsaving"} the paper.`,
      );
      return;
    }
    const supabase = createClient();
    const { error } = await supabase
      .from("event")
      .insert(snakecaseKeys(parsed.data, { deep: true }));
    if (error) {
      toast.error(
        `There was an error ${eventType === "save" ? "saving" : "unsaving"} the paper.`,
      );
      return;
    }
    get().toggleSavePaper(listId);
  },
}));
