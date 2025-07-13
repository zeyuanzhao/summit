import camelcaseKeys from "camelcase-keys";
import { NextRequest } from "next/server";
import { z } from "zod";

import { getRecommendations } from "@/lib/feed";
import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validation/event";
import { listPaperSchema } from "@/lib/validation/listPaper";
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

  let moreIds = [];
  try {
    moreIds = await getRecommendations(remain);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let morePapersPromise;
  if (remain > 0) {
    morePapersPromise = supabase
      .from("paper")
      .select("*")
      .in("id", moreIds)
      .limit(remain);
  }

  const allIds = [...ids, ...moreIds];

  let likePromise;
  let savePromise;
  if (allIds.length === 0 || !user?.id) {
    likePromise = Promise.resolve({ data: [], error: null });
    savePromise = Promise.resolve({ data: [], error: null });
  } else {
    likePromise = supabase
      .from("latest_like")
      .select("*")
      .eq("user_id", user?.id)
      .in("paper_id", allIds);

    savePromise = supabase
      .from("list_paper")
      .select("*")
      .eq("user_id", user?.id)
      .in("paper_id", allIds);
  }

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

  const zodPapers = z.array(paperSchema).safeParse(camelcaseKeys(papers));
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

  const zodLikes = z.array(eventSchema).safeParse(camelcaseKeys(likes));
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

  const zodSaves = z.array(listPaperSchema).safeParse(camelcaseKeys(saves));
  if (!zodSaves.success) {
    return new Response(JSON.stringify({ error: "Invalid save data." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsedSaves = zodSaves.data;

  const likesMap = new Map(
    parsedLikes.map((like) => [like.paperId, like.eventType === "like"]),
  );

  const savesMap = new Map<string, string[]>();
  parsedSaves.forEach((save) => {
    if (!savesMap.has(save.paperId)) {
      savesMap.set(save.paperId, []);
    }
    savesMap.get(save.paperId)?.push(save.listId);
  });

  const papersWithState = parsedPapers.map((paper) => ({
    ...paper,
    liked: likesMap.get(paper.id || "") || false,
    lists: savesMap.get(paper.id || "") || [],
  }));

  return new Response(JSON.stringify(papersWithState), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
