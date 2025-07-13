import camelcaseKeys from "camelcase-keys";

import { createClient } from "./supabase/server";
import { normalizeVector } from "./utils";
import { paperMatchSchema } from "./validation/paperMatch";
import { profileSchema } from "./validation/profile";

async function getAnonymousRecommendations(limit: number = 10) {
  if (limit <= 0) {
    return [];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paper")
    .select("id")
    .limit(limit * 3);
  if (error) {
    throw new Error(`Failed to fetch recommendations: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error("No recommendations found");
  }
  const shuffled = data.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit).map((paper) => paper.id);
}

export async function getRecommendations(limit: number = 10) {
  const supabase = await createClient();
  const { user } = (await supabase.auth.getUser()).data;
  if (!user?.id) {
    return getAnonymousRecommendations(limit);
  }
  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user.id)
    .single();
  if (profileError || !profileData) {
    throw new Error("User profile not found");
  }
  const parsedProfile = profileSchema.safeParse(camelcaseKeys(profileData));
  if (!parsedProfile.success) {
    throw new Error("Invalid profile data");
  }
  const { embedding: userEmbedding } = parsedProfile.data;
  if (!userEmbedding) {
    return getAnonymousRecommendations(limit);
  }
  const normalizedUserEmbedding = normalizeVector(userEmbedding);
  if (!normalizedUserEmbedding) {
    throw new Error("Invalid user embedding");
  }
  const { data, error } = await supabase.rpc("match_papers_by_embedding", {
    query_embedding: normalizedUserEmbedding,
    match_count: limit * 3,
  });
  if (error) {
    throw new Error(`Failed to fetch papers: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error("No papers found");
  }
  const parsedData = paperMatchSchema.array().safeParse(camelcaseKeys(data));
  if (!parsedData.success) {
    throw new Error("Invalid paper data");
  }
  const shuffled = parsedData.data.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit).map((paper) => paper.id);
}
