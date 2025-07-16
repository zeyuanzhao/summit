"use client";

import { useContext, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { UserContext } from "@/components/context/user-context";
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
  const user = useContext(UserContext);
  const [likedState, setLikedState] = useState(liked);
  const [paperLists, setPaperLists] = useState(lists || []);
  const onLike = async () => {
    const id = paperDetail?.id;
    if (!id) {
      toast.error("Paper ID is missing");
      return;
    }
    const eventType = likedState ? "unlike" : "like";
    if (!user?.id) {
      toast.error(`You must be logged in to ${eventType} a paper.`);
      return;
    }
    let error;
    if (eventType === "like") {
      ({ error } = await fetch(`/api/papers/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()));
    } else if (eventType === "unlike") {
      ({ error } = await fetch(`/api/papers/${id}/unlike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()));
    }
    if (error) {
      toast.error(error || `Failed to ${eventType} paper.`);
      return;
    }
    setLikedState(!likedState);
  };
  const onSave = async (listId: string) => {
    const id = paperDetail?.id;
    if (!id) {
      toast.error("Paper ID is missing");
      return;
    }
    const eventType = paperLists.includes(listId) ? "unsave" : "save";
    if (!user?.id) {
      toast.error(`You must be logged in to ${eventType} a paper.`);
      return;
    }
    let error;
    if (eventType === "save") {
      ({ error } = await fetch(`/api/papers/${id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listId }),
      }).then((res) => res.json()));
    } else if (eventType === "unsave") {
      ({ error } = await fetch(`/api/papers/${id}/unsave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listId }),
      }).then((res) => res.json()));
    }
    if (error) {
      toast.error(error || `Failed to ${eventType} paper.`);
      return;
    }
    if (eventType === "save") {
      setPaperLists((prev) => [...prev, listId]);
    } else {
      setPaperLists((prev) => prev.filter((list) => list !== listId));
    }
    toast.success("Paper saved successfully.");
  };
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
              <LikePaperButton liked={likedState} onLike={onLike} />
              <SavePaperMenu
                handleSave={onSave}
                paperLists={paperLists}
                saved={paperLists.length > 0}
              />
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
