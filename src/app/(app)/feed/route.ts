import { NextResponse } from "next/server";

import { getRecommendations } from "@/lib/feed";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { user } = (await supabase.auth.getUser()).data;
  const recommendations = await getRecommendations(user?.id ?? undefined, 1);

  return NextResponse.redirect(new URL(`/feed/${recommendations[0]}`));
}
