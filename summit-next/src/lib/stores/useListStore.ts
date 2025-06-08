import { toast } from "sonner";
import { create } from "zustand";

import { List, ListStore } from "@/interfaces";

import { createClient } from "../supabase/client";

const supabase = createClient();

export const useListStore = create<ListStore>()((set, get) => ({
  lists: [],
  initialized: false,
  setInitialized: (initialized: boolean) => set({ initialized }),
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
  getLists: async (userId: string | null) => {
    if (!userId) {
      toast.error("You must be logged in to get lists.");
      return [];
    }
    const { lists } = get();
    if (get().initialized) return lists;
    await get().fetchLists(userId);
    return get().lists;
  },
  fetchLists: async (userId: string | null) => {
    if (!userId) {
      toast.error("You must be logged in to fetch lists.");
      return;
    }
    const { data } = await supabase
      .from("list")
      .select("*")
      .eq("user_id", userId);
    if (data) {
      set({ lists: data });
    }
    get().setInitialized(true);
  },
}));
