import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ErrorMessage } from "@/components/error";
import { LikePaperButton } from "@/components/like-paper-button";
import { SavePaperMenu } from "@/components/save-paper-menu";
import { Badge } from "@/components/ui/badge";
import { PaperDetail } from "@/interfaces";

export function PaperPage({
  paperDetail,
  liked,
  lists,
}: {
  paperDetail: PaperDetail;
  liked?: boolean;
  lists?: string[];
}) {
  if (!paperDetail) {
    return <ErrorMessage title="Paper not found." />;
  }

  return (
    <div className="flex flex-1 flex-row justify-center">
      <div className="flex max-w-6xl flex-1 flex-col px-28 py-20 pt-8">
        <div className="mt-16 flex flex-col">
          <h1 className="text-4xl font-bold">{paperDetail?.title}</h1>
          <div className="mt-2">
            <p className="text-lg">
              {paperDetail?.authors?.map((author) => author.name).join(", ")}
            </p>
          </div>
          <div className="mt-4 flex flex-row">
            <div className="flex flex-1 flex-row">
              {paperDetail?.tags?.map((tag) => {
                return (
                  <Badge key={tag.id} variant="outline" className="mr-2">
                    {tag.name}
                  </Badge>
                );
              })}
            </div>
            <div className="flex flex-row items-center gap-2">
              <LikePaperButton paperId={paperDetail.id} liked={liked} />
              <SavePaperMenu />
            </div>
          </div>
          <div className="mt-4 flex flex-1 flex-col">
            <div className="dark:bg-muted bg-muted prose dark:prose-invert !max-w-none flex-1 rounded-2xl p-8">
              <h2>Summary</h2>
              <Markdown remarkPlugins={[remarkGfm]}>
                {paperDetail?.summary || "No summary available."}
              </Markdown>
            </div>
            <div className="prose dark:prose-invert mb-8 mt-4 !max-w-none p-4">
              <h2>Abstract</h2>
              <Markdown remarkPlugins={[remarkGfm]}>
                {paperDetail?.abstract || "No abstract available."}
              </Markdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
