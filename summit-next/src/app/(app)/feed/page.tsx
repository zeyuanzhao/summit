"use client";

import { useEffect, useRef } from "react";

import { FeedSidebar } from "@/components/feed-sidebar";
import { PaperCard } from "@/components/paper-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeedStore } from "@/lib/stores/useFeedStore";

export default function Page() {
  const {
    feed,
    currentPage,
    setCurrentPage,
    fetchInitialFeed,
    fetchMoreFeed,
    likePaper,
    savePaper,
  } = useFeedStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const hasNavigatedBack = useRef(false);

  useEffect(() => {
    fetchInitialFeed();
  }, [fetchInitialFeed]);

  useEffect(() => {
    if (feed.length > 0) {
      window.history.replaceState(null, "", `/feed/${feed[0].id}`);
    }
  }, [feed]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      let cumulativeHeight = 0;
      const { scrollTop } = container;

      for (let i = 0; i < cardRefs.current.length; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;

        cumulativeHeight += card.offsetHeight;

        if (scrollTop < cumulativeHeight) {
          if (i !== currentPage) {
            setCurrentPage(i);
            window.history.pushState(null, "", `/feed/${feed[i]?.id || ""}`);
          }
          break;
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    // eslint-disable-next-line consistent-return
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [setCurrentPage, feed, currentPage]);

  useEffect(() => {
    if (hasNavigatedBack.current) return;
    const container = containerRef.current;
    if (container) {
      let cumulativeHeight = 0;
      for (let i = 0; i < currentPage; i++) {
        const card = cardRefs.current[i];
        if (card) {
          cumulativeHeight += card.offsetHeight;
        }
      }
      container.scrollTo({
        top: cumulativeHeight,
        behavior: "auto",
      });
    }
  }, [currentPage]);

  useEffect(() => {
    if (feed.length - currentPage < 2) {
      fetchMoreFeed();
    }
  }, [currentPage, feed, fetchMoreFeed]);

  useEffect(() => {
    if (!hasNavigatedBack.current) {
      hasNavigatedBack.current = true;
    }
  }, []);

  const handleIncrement = () => {
    const container = containerRef.current;
    if (container) {
      let cumulativeHeight = 0;
      for (let i = 0; i < currentPage + 1; i++) {
        const card = cardRefs.current[i];
        if (card) {
          cumulativeHeight += card.offsetHeight;
        }
      }
      container.scrollTo({
        top: cumulativeHeight,
        behavior: "smooth",
      });
    }
  };

  const handleDecrement = () => {
    const container = containerRef.current;
    if (container) {
      let cumulativeHeight = 0;
      for (let i = 0; i < currentPage - 1; i++) {
        const card = cardRefs.current[i];
        if (card) {
          cumulativeHeight += card.offsetHeight;
        }
      }
      container.scrollTo({
        top: cumulativeHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex h-screen flex-1 flex-row items-center justify-center">
      <div
        ref={containerRef}
        className="no-scrollbar flex h-screen w-full snap-y snap-mandatory flex-col items-center gap-y-4 overflow-auto p-6 pt-12"
      >
        {feed.length === 0 && (
          <Skeleton className="h-[400px] w-[600px] flex-shrink-0 overflow-hidden" />
        )}
        {feed.map((paper, i) => (
          <PaperCard
            // eslint-disable-next-line react/no-array-index-key
            key={`${paper.id}-${i}`}
            ref={(el) => {
              cardRefs.current[i] = el!;
            }}
            className="h-[calc(100vh-95px)] min-h-[400px] w-[600px] flex-shrink-0 snap-center snap-always overflow-hidden"
            {...paper}
          />
        ))}
      </div>
      <FeedSidebar
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        handleLike={likePaper}
        liked={feed[currentPage]?.liked || false}
        handleSave={async (listId: string) => {
          await savePaper(listId);
        }}
        saved={feed[currentPage]?.lists?.length > 0}
        paperLists={feed[currentPage]?.lists || []}
      />
    </div>
  );
}
