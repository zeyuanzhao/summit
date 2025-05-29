import { redirect } from "next/navigation";

export async function GET() {
  // temporary redirect
  return redirect("/feed/0");
}
