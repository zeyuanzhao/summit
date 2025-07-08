import camelcaseKeys from "camelcase-keys";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ErrorMessage } from "@/components/error";
import { createClient } from "@/lib/supabase/server";
import { listSchema } from "@/lib/validation/list";
import { paperSchema } from "@/lib/validation/paper";

import { ListPage } from "./ListPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) {
    return (
      <ErrorMessage
        title="List Not Found"
        error="The requested list does not exist."
      />
    );
  }
  const supabase = await createClient();
  const { data: user, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    return redirect("/auth/login");
  }

  const listsPromise = supabase
    .from("list")
    .select("*")
    .eq("user_id", user.user.id);

  const listPapersPromise = supabase
    .from("list_paper")
    .select("paper(*)")
    .eq("list_id", id);

  const [listsResult, listPapersResult] = await Promise.all([
    listsPromise,
    listPapersPromise,
  ]);

  const { data: lists, error: errorLists } = listsResult;
  const { data: listPapers, error: errorListPapers } = listPapersResult;

  if (errorLists || errorListPapers) {
    return <ErrorMessage title="Error" error="Failed to fetch data." />;
  }

  const zodLists = z.array(listSchema).safeParse(camelcaseKeys(lists));
  if (!zodLists.success) {
    return <ErrorMessage title="Error" error="Invalid list data." />;
  }

  const zodListPapers = z
    .array(paperSchema)
    .safeParse(listPapers.map((lp) => camelcaseKeys(lp.paper)));
  if (!zodListPapers.success) {
    return <ErrorMessage title="Error" error="Invalid papers data." />;
  }

  const parsedLists = zodLists.data;
  const parsedListPapers = zodListPapers.data;
  if (parsedLists.length === 0 || !parsedLists.some((list) => list.id === id)) {
    return (
      <ErrorMessage
        title="List Not Found"
        error="The requested list does not exist."
      />
    );
  }
  return (
    <div className="flex flex-1 flex-row justify-around">
      <ListPage lists={parsedLists} listPapers={parsedListPapers} id={id} />
    </div>
  );
}
