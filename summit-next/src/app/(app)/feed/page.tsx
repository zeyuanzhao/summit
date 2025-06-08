"use client";

import { useContext, useEffect, useRef } from "react";
import snakecaseKeys from "snakecase-keys";
import { toast } from "sonner";

import { UserContext } from "@/components/context/user-context";
import { FeedSidebar } from "@/components/feed-sidebar";
import { PaperCard } from "@/components/paper-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeedStore } from "@/lib/stores/useFeedStore";
import { createClient } from "@/lib/supabase/client";
import { eventSchema } from "@/lib/validation/event";

export default function Page() {
  const {
    feed,
    addToFeed,
    initialized,
    setInitialized,
    setCurrentPage,
    currentPage,
    like,
    unlike,
  } = useFeedStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const hasNavigatedBack = useRef(false);
  const supabase = createClient();
  const user = useContext(UserContext);

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

  const handleLike = async (paperId: string) => {
    if (!user) {
      toast.error("You must be logged in to like papers.");
      return;
    }

    if (!paperId) {
      toast.error("Invalid paper ID.");
      return;
    }

    const event = eventSchema.safeParse({
      userId: user.id,
      paperId,
      eventType: feed[currentPage]?.liked ? "unlike" : "like",
      payload: {},
    });

    if (!event.success) {
      toast.error("There was an error liking the paper.");
      return;
    }

    const { error } = await supabase
      .from("event")
      .insert(snakecaseKeys(event.data));

    if (error) {
      toast.error("There was an error liking the paper.");
      return;
    }

    if (feed[currentPage]?.liked) {
      unlike();
    } else {
      like();
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
            className="max-h-[calc(100vh-95px)] min-h-[400px] w-[600px] flex-shrink-0 snap-center snap-always overflow-hidden"
            {...paper}
          />
        ))}
      </div>
      <FeedSidebar
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        handleLike={handleLike}
        liked={feed[currentPage]?.liked || false}
      />
    </div>
  );
}
