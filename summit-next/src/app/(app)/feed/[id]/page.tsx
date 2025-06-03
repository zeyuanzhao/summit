"use client";

import { use, useEffect, useRef } from "react";
import { toast } from "sonner";

import { FeedSidebar } from "@/components/feed-sidebar";
import { PaperCard } from "@/components/paper-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeedStore } from "@/lib/stores/useFeedStore";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const {
    feed,
    addToFeed,
    initialized,
    setInitialized,
    setCurrentPage,
    incrementPage,
    decrementPage,
  } = useFeedStore();
  const { id } = use(params);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleIncrement = () => {
    incrementPage();
    const container = containerRef.current;
    if (container) {
      const snapHeight = container.offsetHeight;
      container.scrollTo({
        top: container.scrollTop - snapHeight,
        behavior: "smooth",
      });
    }
  };

  const handleDecrement = () => {
    decrementPage();
    const container = containerRef.current;
    if (container) {
      const snapHeight = container.offsetHeight;
      container.scrollTo({
        top: container.scrollTop + snapHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex h-screen flex-1 flex-row items-center justify-center">
      <div
        ref={containerRef}
        className="no-scrollbar flex h-screen w-full snap-y snap-mandatory flex-col items-center gap-y-8 overflow-auto p-6"
      >
        {feed.length === 0 && (
          <Skeleton className="min-h-[400px] w-[600px] flex-shrink-0 overflow-hidden" />
        )}
        {feed.map((paper) => (
          <PaperCard
            key={paper.id}
            className="max-h-[calc(100vh-100px)] min-h-[400px] w-[600px] flex-shrink-0 snap-center snap-always overflow-hidden"
            {...paper}
          />
        ))}
      </div>
      <FeedSidebar
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />
    </div>
  );
}
