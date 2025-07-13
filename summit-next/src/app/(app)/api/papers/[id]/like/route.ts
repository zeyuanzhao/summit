import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";

import { createClient } from "@/lib/supabase/server";
import { normalizeVector } from "@/lib/utils";
import { eventSchema } from "@/lib/validation/event";
import { paperSchema } from "@/lib/validation/paper";
import { profileSchema } from "@/lib/validation/profile";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const paperId = (await params).id;
  const supabase = await createClient();
  const { user } = (await supabase.auth.getUser()).data;
  if (!user?.id) {
    return new Response(
      JSON.stringify({ error: "You must be logged in to like papers." }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
  if (!paperId) {
    return new Response(JSON.stringify({ error: "Invalid paper ID." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const parsed = eventSchema.safeParse({
    userId: user.id,
    paperId,
    eventType: "like",
    payload: {},
  });
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid event data." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { data: paperData, error: paperError } = await supabase
    .from("paper")
    .select()
    .eq("id", paperId)
    .single();
  if (paperError || !paperData) {
    return new Response(JSON.stringify({ error: "Paper not found." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const zodPaper = paperSchema.safeParse(camelcaseKeys(paperData));
  if (!zodPaper.success) {
    return new Response(JSON.stringify({ error: "Invalid paper data." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { embedding: paperEmbedding } = zodPaper.data;
  if (paperEmbedding) {
    const { data: profileData, error: profileError } = await supabase
      .from("profile")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileError || !profileData) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const zodProfile = profileSchema.safeParse(camelcaseKeys(profileData));
    if (!zodProfile.success) {
      return new Response(JSON.stringify({ error: "Invalid profile data." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    let { embedding: userEmbedding } = zodProfile.data;
    if (!userEmbedding) {
      userEmbedding = new Array(paperEmbedding.length).fill(0);
    }
    const newEmbedding = normalizeVector(
      paperEmbedding.map((v, i) => {
        return 0.2 * v + 0.8 * userEmbedding[i];
      }),
    );
    const { error: updateEmbeddingError } = await supabase
      .from("profile")
      .update({
        embedding: newEmbedding,
      })
      .eq("id", user.id);
    if (updateEmbeddingError) {
      return new Response(
        JSON.stringify({ error: "Failed to update user embedding." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }
  const { error } = await supabase
    .from("event")
    .insert(snakecaseKeys(parsed.data));
  if (error) {
    return new Response(JSON.stringify({ error: "Failed to like paper." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
