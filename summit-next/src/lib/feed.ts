import { createClient } from "./supabase/server";

export async function getRecommendations(userId?: string, limit: number = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paper")
    .select("*")
    .order("title", { ascending: true })
    .limit(limit * 2);
  if (error) {
    throw new Error(`Failed to fetch recommendations: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error("No recommendations found");
  }
  const shuffled = data.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit).map((paper) => paper.id);
}
