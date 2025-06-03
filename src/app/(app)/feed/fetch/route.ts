import { NextRequest } from "next/server";

import { getRecommendations } from "@/lib/feed";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ids = searchParams.getAll("ids") || [];
  const limit = parseInt(searchParams.get("limit") || "4", 10);
  const supabase = await createClient();
  const { user } = (await supabase.auth.getUser()).data;
  const remain = limit - ids.length;
  const { data: recommendations, error } = await supabase
    .from("paper")
    .select("*")
    .in("id", ids)
    .limit(limit);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (remain > 0) {
    const moreIds = await getRecommendations(user?.id, remain);
    const { data: moreRecommendations, error: moreError } = await supabase
      .from("paper")
      .select("*")
      .in("id", moreIds)
      .limit(remain);
    if (moreError) {
      return new Response(JSON.stringify({ error: moreError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    recommendations.push(...moreRecommendations);
  }
  return new Response(JSON.stringify(recommendations), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
