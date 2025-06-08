import { create } from "zustand";

import { List, ListStore } from "@/interfaces";

export const useListStore = create<ListStore>()((set, get) => ({
  lists: [],
  setLists: (newLists: List[]) => set({ lists: newLists }),
  addToLists: (newLists: List[]) => {
    const currentLists = get().lists;
    set({ lists: [...currentLists, ...newLists] });
  },
  removeFromLists: (listId: string) =>
    set((state) => ({
      lists: state.lists.filter((list) => list.id !== listId),
    })),
  updateList: (listId: string, updatedList: Partial<List>) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId ? { ...list, ...updatedList } : list,
      ),
    })),
}));
