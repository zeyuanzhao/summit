import { redirect } from "next/navigation";
import { z } from "zod";

import { ErrorMessage } from "@/components/error";
import { ListCard } from "@/components/list-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { listSchema } from "@/lib/validation/list";

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

  const zodLists = z.array(listSchema).safeParse(lists);
  if (!zodLists.success) {
    console.error("Invalid list data:", zodLists.error);
    return <ErrorMessage title="Error" error="Invalid list data." />;
  }

  const parsedLists = zodLists.data;

  return (
    <div className="flex flex-1 flex-row justify-around">
      <div className="flex max-w-6xl flex-1 flex-col px-28 py-20">
        <div className="mb-12 flex flex-row items-center justify-between">
          <h2 className="text-4xl font-bold">Lists</h2>
          <Button variant="outline">Create List</Button>
        </div>
        {lists && lists.length > 0 ? (
          <div className="grid">
            {parsedLists.map((list) => (
              <ListCard className="h-40 w-96" {...list} key={list.id} />
            ))}
          </div>
        ) : (
          <p>You don&apos;t have any lists yet.</p>
        )}
      </div>
    </div>
  );
}
