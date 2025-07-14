import camelcaseKeys from "camelcase-keys";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ErrorMessage } from "@/components/error";
import { createClient } from "@/lib/supabase/server";
import { listSchema } from "@/lib/validation/list";

import { ListsPage } from "./ListsPage";

export const metadata: Metadata = {
  title: "Lists",
  description: "Your personal lists of papers",
};

export default async function Page() {
  const supabase = await createClient();
  const { data: user, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    return redirect("/auth/login");
  }

  const { data: lists, error } = await supabase
    .from("list")
    .select("*")
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <ErrorMessage title="Error" error="Failed to fetch lists." />;
  }

  const zodLists = z.array(listSchema).safeParse(camelcaseKeys(lists));
  if (!zodLists.success) {
    return <ErrorMessage title="Error" error="Invalid list data." />;
  }

  const parsedLists = zodLists.data;

  return (
    <div className="flex flex-1 flex-row justify-around">
      <ListsPage lists={parsedLists} />
    </div>
  );
}
