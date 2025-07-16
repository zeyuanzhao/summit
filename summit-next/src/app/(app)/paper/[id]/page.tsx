import camelcaseKeys from "camelcase-keys";

import { ErrorMessage } from "@/components/error";
import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validation/event";
import { listPaperSchema } from "@/lib/validation/listPaper";
import { paperDetailSchema } from "@/lib/validation/paperDetail";

import { PaperPage } from "./PaperPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const paperPromise = supabase
    .from("paper_detail")
    .select("*")
    .eq("id", id)
    .single();
  const likePromise = supabase
    .from("latest_like")
    .select("*")
    .eq("paper_id", id);
  const savePromise = supabase
    .from("list_paper")
    .select("*")
    .eq("paper_id", id);
  const [paperResult, likeResult, saveResult] = await Promise.all([
    paperPromise,
    likePromise,
    savePromise,
  ]);
  const { data: paperData, error: paperError } = paperResult;
  const { data: likeData, error: likeError } = likeResult;
  const { data: saveData, error: saveError } = saveResult;
  if (paperError || likeError || saveError) {
    return <ErrorMessage title="Failed to load paper details." />;
  }

  const zodPaper = paperDetailSchema.safeParse(camelcaseKeys(paperData));

  if (!zodPaper.success) {
    return <ErrorMessage title="Invalid paper data." />;
  }

  const parsedPaper = zodPaper.data;

  const zodLike = eventSchema.array().safeParse(camelcaseKeys(likeData));

  if (!zodLike.success) {
    return <ErrorMessage title="Invalid like data." />;
  }

  const parsedLike = zodLike.data[0];

  const zodSave = listPaperSchema.array().safeParse(camelcaseKeys(saveData));

  if (!zodSave.success) {
    return <ErrorMessage title="Invalid save data." />;
  }

  const parsedSave = zodSave.data;

  const liked = parsedLike ? parsedLike.eventType === "like" : false;
  const lists = parsedSave.map((item) => item.listId);

  return <PaperPage paperDetail={parsedPaper} liked={liked} lists={lists} />;
}
