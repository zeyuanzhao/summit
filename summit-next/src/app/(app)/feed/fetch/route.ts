import { NextRequest } from "next/server";
import { z } from "zod";

import { getRecommendations } from "@/lib/feed";
import { createClient } from "@/lib/supabase/server";
import { paperSchema } from "@/lib/validation/paper";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ids = searchParams.getAll("ids") || [];
  const limit = parseInt(searchParams.get("limit") || "4", 10);
  const supabase = await createClient();
  const { user } = (await supabase.auth.getUser()).data;
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
  const remain = limit - recommendations.length;
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
  // validate recommendations with zod schema paperSchema
  const zodPapers = z.array(paperSchema).safeParse(recommendations);
  if (!zodPapers.success) {
    console.error("Invalid paper data:", zodPapers.error);
    return new Response(JSON.stringify({ error: "Invalid paper data." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsedPapers = zodPapers.data;

  return new Response(JSON.stringify(parsedPapers), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
