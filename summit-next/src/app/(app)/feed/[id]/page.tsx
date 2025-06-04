"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { useFeedStore } from "@/lib/stores/useFeedStore";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { addToFeed, initialized, setInitialized } = useFeedStore();
  const router = useRouter();

  useEffect(() => {
    if (initialized) return;
    const fetchFeed = async () => {
      try {
        const { id } = await params;
        const url = new URL("/feed/fetch", window.location.origin);
        url.searchParams.append("limit", "4");
        url.searchParams.append("ids", id as string);
        const data = await fetch(url.toString());
        if (!data.ok) {
          const error = await data.json();
          throw new Error(error.message || "Failed to fetch feed");
        }
        const jsonData = await data.json();
        addToFeed(jsonData);
        window.history.replaceState(null, "", `/feed/${jsonData[0]?.id || ""}`);
        setInitialized(true);
        router.push("/feed");
      } catch (error) {
        toast.error((error as Error).message || "Failed to fetch feed");
      }
    };
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToFeed, initialized]);
}
