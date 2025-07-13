import snakecaseKeys from "snakecase-keys";

import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validation/event";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const paperId = (await params).id;
  const { listId } = await request.json();
  const supabase = await createClient();
  const { user } = (await supabase.auth.getUser()).data;
  if (!user?.id) {
    return new Response(
      JSON.stringify({ error: "You must be logged in to unsave papers." }),
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
    eventType: "save",
    payload: {
      listId,
    },
  });
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid event data." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { error } = await supabase
    .from("event")
    .insert(snakecaseKeys(parsed.data, { deep: true }));
  if (error) {
    return new Response(JSON.stringify({ error: "Failed to unsave paper." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
