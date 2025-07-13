import { toast } from "sonner";
import { create } from "zustand";

import { FeedStore, Paper, PaperUserData } from "@/interfaces";

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
      const url = new URL("/api/feed/fetch", window.location.origin);
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
      const url = new URL("/api/feed/fetch", window.location.origin);
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
  likePaper: async () => {
    const { currentPage, feed } = get();
    const paper = feed[currentPage];
    const eventType = paper.liked ? "unlike" : "like";
    let error;
    if (eventType === "like") {
      ({ error } = await fetch(`/api/papers/${paper.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()));
    } else if (eventType === "unlike") {
      ({ error } = await fetch(`/api/papers/${paper.id}/unlike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()));
    }
    if (error) {
      toast.error(error || `Failed to ${eventType} paper.`);
      return;
    }
    get().toggleLikePaper();
  },
  savePaper: async (listId: string) => {
    const { currentPage, feed } = get();
    const paper = feed[currentPage];
    const eventType = paper.lists.includes(listId) ? "unsave" : "save";
    let error;
    if (eventType === "save") {
      ({ error } = await fetch(`/api/papers/${paper.id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listId }),
      }).then((res) => res.json()));
    } else if (eventType === "unsave") {
      ({ error } = await fetch(`/api/papers/${paper.id}/unsave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listId }),
      }).then((res) => res.json()));
    }
    if (error) {
      toast.error(error || `Failed to ${eventType} paper.`);
      return;
    }
    get().toggleSavePaper(listId);
  },
}));
