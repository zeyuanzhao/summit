import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/auth/login");
}

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/auth/login");
}
