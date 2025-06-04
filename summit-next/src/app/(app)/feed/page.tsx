"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { FeedSidebar } from "@/components/feed-sidebar";
import { PaperCard } from "@/components/paper-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeedStore } from "@/lib/stores/useFeedStore";

export default function Page() {
  const {
    feed,
    addToFeed,
    initialized,
    setInitialized,
    setCurrentPage,
    incrementPage,
    decrementPage,
    currentPage,
  } = useFeedStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasNavigatedBack = useRef(false);

  useEffect(() => {
    const fetchFeed = async () => {
      if (initialized) {
        window.history.replaceState(null, "", `/feed/${feed[0]?.id || ""}`);
        return;
      }
      try {
        const url = new URL("/feed/fetch", window.location.origin);
        url.searchParams.append("limit", "4");
        const data = await fetch(url.toString());
        if (!data.ok) {
          const error = await data.json();
          throw new Error(error.message || "Failed to fetch feed");
        }
        const jsonData = await data.json();
        addToFeed(jsonData);
        window.history.replaceState(null, "", `/feed/${jsonData[0]?.id || ""}`);
        setInitialized(true);
      } catch (error) {
        toast.error((error as Error).message || "Failed to fetch feed");
      }
    };
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToFeed, initialized]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const snapHeight = container.offsetHeight;
      const page = Math.round(container.scrollTop / snapHeight);
      if (page !== currentPage) {
        setCurrentPage(page);
        window.history.pushState(null, "", `/feed/${feed[page]?.id || ""}`);
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
      const snapHeight = container.offsetHeight;
      container.scrollTo({
        top: currentPage * snapHeight,
        behavior: "auto",
      });
    }
  }, [currentPage]);

  useEffect(() => {
    const { length } = feed;
    if (length - currentPage < 2) {
      const fetchMore = async () => {
        try {
          const url = new URL("/feed/fetch", window.location.origin);
          url.searchParams.append("limit", "4");
          const data = await fetch(url.toString());
          if (!data.ok) {
            const error = await data.json();
            throw new Error(error.message || "Failed to fetch more feed");
          }
          const jsonData = await data.json();
          addToFeed(jsonData);
        } catch (error) {
          toast.error((error as Error).message || "Failed to fetch more feed");
        }
      };
      fetchMore();
    }
  }, [addToFeed, currentPage, feed]);

  useEffect(() => {
    if (!hasNavigatedBack.current) {
      hasNavigatedBack.current = true;
    }
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
      const page = Math.round(container.scrollTop / snapHeight) - 1;
      setCurrentPage(page);
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
      const page = Math.round(container.scrollTop / snapHeight) + 1;
      setCurrentPage(page);
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
            className="max-h-[calc(100vh-95px)] min-h-[400px] w-[600px] flex-shrink-0 snap-center snap-always overflow-hidden"
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
