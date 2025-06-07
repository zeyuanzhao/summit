import { create } from "zustand";

import { FeedStore, Paper } from "@/interfaces";

export const useFeedStore = create<FeedStore>()((set, get) => ({
  feed: [],
  currentPage: 0,
  initialized: false,
  setFeed: (newFeed: Paper[]) => set({ feed: newFeed }),
  addToFeed: (newPapers: Paper[]) => {
    const currentFeed = get().feed;
    set({ feed: [...currentFeed, ...newPapers] });
  },
  setCurrentPage: (page: number) => set({ currentPage: page }),
  incrementPage: () => set((state) => ({ currentPage: state.currentPage + 1 })),
  decrementPage: () =>
    set((state) => ({ currentPage: Math.max(0, state.currentPage - 1) })),
  setInitialized: (initialized: boolean) =>
    set((state) => ({ ...state, initialized })),
}));
