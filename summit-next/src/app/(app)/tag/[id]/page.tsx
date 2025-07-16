import camelcaseKeys from "camelcase-keys";

import { ErrorMessage } from "@/components/error";
import { createClient } from "@/lib/supabase/server";
import { paperSchema } from "@/lib/validation/paper";
import { tagSchema } from "@/lib/validation/tag";

import { TagPage } from "./TagPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const tagPromise = supabase.from("tag").select("*").eq("id", id).single();
  const paperPromise = supabase
    .from("tag_paper")
    .select("paper(*)")
    .eq("tag_id", id);

  const [tagResponse, paperResponse] = await Promise.all([
    tagPromise,
    paperPromise,
  ]);

  const { data: tagData, error: tagError } = tagResponse;
  const { data: paperData, error: paperError } = paperResponse;

  if (tagError || paperError || !tagData) {
    return <ErrorMessage title="Failed to fetch tag or papers." />;
  }

  const zodPapers = paperSchema
    .array()
    .safeParse(paperData.map((item) => camelcaseKeys(item.paper)));
  if (!zodPapers.success) {
    return <ErrorMessage title="Invalid paper data." />;
  }
  const papers = zodPapers.data;
  const zodTag = tagSchema.safeParse(camelcaseKeys(tagData));
  if (!zodTag.success) {
    return <ErrorMessage title="Invalid tag data." />;
  }
  const tag = zodTag.data;
  return <TagPage tag={tag} papers={papers} />;
}
