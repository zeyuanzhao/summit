import { create } from "zustand";

import { FeedStore, PaperCardProps } from "@/interfaces";

export const useFeedStore = create<FeedStore>()((set, get) => ({
  feed: [],
  currentPage: 0,
  setFeed: (newFeed: PaperCardProps[]) => set({ feed: newFeed }),
  addToFeed: (newPapers: PaperCardProps[]) => {
    const currentFeed = get().feed;
    set({ feed: [...currentFeed, ...newPapers] });
  },
  setCurrentPage: (page: number) => set({ currentPage: page }),
  incrementPage: () => set((state) => ({ currentPage: state.currentPage + 1 })),
  decrementPage: () =>
    set((state) => ({ currentPage: Math.max(0, state.currentPage - 1) })),
}));
