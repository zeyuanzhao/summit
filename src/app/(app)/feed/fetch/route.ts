import { createClient } from "@/lib/supabase/server";

export async function GET({
  params,
}: {
  params: { ids: string[]; limit: number };
}) {
  const supabase = await createClient();
  const remain = params.limit - params.ids.length;
  const { data: recommendations, error } = await supabase
    .from("paper")
    .select("*")
    .in("id", params.ids)
    .limit(params.limit);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (remain > 0) {
    const { data: moreRecommendations, error: moreError } = await supabase
      .from("paper")
      .select("*")
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
