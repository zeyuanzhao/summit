import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
