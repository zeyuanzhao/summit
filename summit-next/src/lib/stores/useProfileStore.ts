import camelcaseKeys from "camelcase-keys";
import { toast } from "sonner";
import { create } from "zustand";

import { ProfileStore } from "@/interfaces";

import { createClient } from "../supabase/client";
import { profileSchema } from "../validation/profile";

export const useProfileStore = create<ProfileStore>()((set, get) => ({
  profile: null,
  initialized: false,
  setProfile: (profile) => set({ profile }),
  setInitialized: (initialized) => set({ initialized }),
  fetchProfile: async () => {
    const supabase = createClient();
    const { user } = (await supabase.auth.getUser()).data;
    const userId = user?.id;
    if (!userId) {
      get().setInitialized(true);
      return;
    }
    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", userId)
      .single();
    get().setInitialized(true);
    if (error) {
      toast.error("Failed to fetch profile.");
    }
    const zodProfile = profileSchema.safeParse(camelcaseKeys(data));
    const parsedProfile = zodProfile.success ? zodProfile.data : null;
    if (!parsedProfile) {
      toast.error("Invalid profile data.");
      return;
    }
    get().setProfile(parsedProfile);
  },
}));
