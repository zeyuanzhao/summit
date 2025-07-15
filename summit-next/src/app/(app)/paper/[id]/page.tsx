import camelcaseKeys from "camelcase-keys";

import { ErrorMessage } from "@/components/error";
import { createClient } from "@/lib/supabase/server";
import { paperDetailSchema } from "@/lib/validation/paperDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: paperData, error: paperError } = await supabase
    .from("paper_detail")
    .select("*")
    .eq("id", id)
    .single();
  if (paperError) {
    return <ErrorMessage title="Failed to load paper details." />;
  }

  const zodPaper = paperDetailSchema.safeParse(camelcaseKeys(paperData));

  if (!zodPaper.success) {
    return <ErrorMessage title="Invalid paper data." />;
  }

  const parsedPaper = zodPaper.data;

  return (
    <div className="flex flex-1">
      <h1>{parsedPaper?.title}</h1>
    </div>
  );
}
