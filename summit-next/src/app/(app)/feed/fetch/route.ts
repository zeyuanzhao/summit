import { NextRequest } from "next/server";
import { z } from "zod";

import { getRecommendations } from "@/lib/feed";
import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validation/event";
import { paperSchema } from "@/lib/validation/paper";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ids = searchParams.getAll("ids") || [];
  const limit = parseInt(searchParams.get("limit") || "4", 10);
  const supabase = await createClient();
  const { user } = (await supabase.auth.getUser()).data;
  const remain = limit - ids.length;

  const papersPromise = supabase
    .from("paper")
    .select("*")
    .in("id", ids)
    .limit(limit);

  const moreIds = await getRecommendations(user?.id, remain);
  let morePapersPromise;
  if (remain > 0) {
    morePapersPromise = supabase
      .from("paper")
      .select("*")
      .in("id", moreIds)
      .limit(remain);
  }

  const allIds = [...ids, ...moreIds];

  const likePromise = supabase
    .from("latest_like")
    .select("*")
    .eq("user_id", user?.id)
    .in("paper_id", allIds);

  const savePromise = supabase
    .from("latest_save")
    .select("*")
    .eq("user_id", user?.id)
    .in("paper_id", allIds);

  const [papersResult, morePapersResult, likesResult, savesResult] =
    await Promise.all([
      papersPromise,
      morePapersPromise,
      likePromise,
      savePromise,
    ]);

  const { data: papers, error: papersError } = papersResult;
  if (papersError) {
    return new Response(JSON.stringify({ error: papersError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (morePapersResult) {
    const { data: morePapers, error: morePapersError } = morePapersResult;
    if (morePapersError) {
      return new Response(JSON.stringify({ error: morePapersError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    papers.push(...morePapers);
  }

  const zodPapers = z.array(paperSchema).safeParse(papers);
  if (!zodPapers.success) {
    return new Response(JSON.stringify({ error: zodPapers.error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsedPapers = zodPapers.data;

  const { data: likes, error: likesError } = likesResult;
  if (likesError) {
    return new Response(JSON.stringify({ error: likesError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const zodLikes = z.array(eventSchema).safeParse(likes);
  if (!zodLikes.success) {
    return new Response(JSON.stringify({ error: "Invalid like data." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsedLikes = zodLikes.data;

  const { data: saves, error: savesError } = savesResult;
  if (savesError) {
    return new Response(JSON.stringify({ error: savesError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const zodSaves = z.array(eventSchema).safeParse(saves);
  if (!zodSaves.success) {
    return new Response(JSON.stringify({ error: "Invalid save data." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsedSaves = zodSaves.data;

  const likesMap = new Map(
    parsedLikes.map((like) => [like.paper_id, like.event_type === "like"]),
  );
  const savesMap = new Map(
    parsedSaves.map((save) => [save.paper_id, save.event_type === "save"]),
  );

  const papersWithState = parsedPapers.map((paper) => ({
    ...paper,
    liked: likesMap.get(paper.id || "") || false,
    saved: savesMap.get(paper.id || "") || false,
  }));

  return new Response(JSON.stringify(papersWithState), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
