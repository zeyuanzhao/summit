import { create } from "zustand";

import { List, ListStore } from "@/interfaces";

import { createClient } from "../supabase/client";

const supabase = createClient();

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
  getLists: async () => {
    const { lists } = get();
    if (lists.length > 0) return lists;
    await get().fetchLists();
    return get().lists;
  },
  fetchLists: async () => {
    const { data } = await supabase.from("lists").select("*");
    if (data) {
      set({ lists: data });
    }
  },
}));
