import { redirect } from "next/navigation";

import { getRecommendations } from "@/lib/feed";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { user } = (await supabase.auth.getUser()).data;
  const recommendations = await getRecommendations(user?.id ?? undefined, 1);

  return redirect(`/feed/${recommendations[0]}`);
}
