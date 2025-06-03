"use client";

import { use, useEffect } from "react";
import { toast } from "sonner";

import { FeedSidebar } from "@/components/feed-sidebar";
import { PaperCard } from "@/components/paper-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeedStore } from "@/lib/stores/useFeedStore";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { feed, addToFeed, initialized, setInitialized } = useFeedStore();
  const { id } = use(params);
  useEffect(() => {
    if (initialized || !id) return;
    const fetchData = async () => {
      try {
        const url = new URL("/feed/fetch", window.location.origin);
        url.searchParams.append("ids", id as string);
        url.searchParams.append("limit", "4");
        const data = await fetch(url.toString());
        if (!data.ok) {
          const errorData = await data.json();
          throw new Error(errorData.error || "Failed to fetch feed data");
        }
        addToFeed(await data.json());
        setInitialized(true);
      } catch (e) {
        toast.error(
          (e as Error).message || "An error occurred while fetching feed data",
        );
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen flex-1 flex-row items-center justify-center gap-40">
      <div className="no-scrollbar flex h-screen flex-col items-center gap-y-8 overflow-auto p-6">
        {feed.length === 0 && (
          <Skeleton className="min-h-[400px] w-[600px] flex-shrink-0 overflow-hidden" />
        )}
        {feed.map((paper) => (
          <PaperCard
            key={paper.id}
            className="min-h-[400px] w-[600px] flex-shrink-0 overflow-hidden"
            {...paper}
          />
        ))}
      </div>
      <FeedSidebar />
    </div>
  );
}
