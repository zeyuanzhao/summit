import camelcaseKeys from "camelcase-keys";
import { HiOutlineHeart } from "react-icons/hi2";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ErrorMessage } from "@/components/error";
import { SavePaperMenu } from "@/components/save-paper-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-1 flex-row justify-center">
      <div className="flex max-w-6xl flex-1 flex-col px-28 py-20 pt-8">
        <div className="mt-16 flex flex-col">
          <h1 className="text-4xl font-bold">{parsedPaper?.title}</h1>
          <div className="mt-2">
            <p className="text-lg">
              {parsedPaper?.authors?.map((author) => author.name).join(", ")}
            </p>
          </div>
          <div className="mt-4 flex flex-row">
            <div className="flex flex-1 flex-row">
              {parsedPaper?.tags?.map((tag) => {
                return (
                  <Badge key={tag.id} variant="outline" className="mr-2">
                    {tag.name}
                  </Badge>
                );
              })}
            </div>
            <div className="flex flex-row items-center gap-2">
              <Button variant="outline" size="icon">
                <HiOutlineHeart />
              </Button>
              <SavePaperMenu />
            </div>
          </div>
          <div className="mt-4 flex flex-1 flex-col">
            <div className="dark:bg-muted bg-muted prose dark:prose-invert !max-w-none flex-1 rounded-2xl p-8">
              <h2>Summary</h2>
              <Markdown remarkPlugins={[remarkGfm]}>
                {parsedPaper?.summary || "No summary available."}
              </Markdown>
            </div>
            <div className="prose dark:prose-invert mb-8 mt-4 !max-w-none p-4">
              <h2>Abstract</h2>
              <Markdown remarkPlugins={[remarkGfm]}>
                {parsedPaper?.abstract || "No abstract available."}
              </Markdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
