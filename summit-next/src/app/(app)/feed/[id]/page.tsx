"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useFeedStore } from "@/lib/stores/useFeedStore";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { addToFeed, fetchInitialFeed, setFeed, setInitialized } =
    useFeedStore();
  const router = useRouter();

  useEffect(() => {
    const fetchFeed = async () => {
      const { id } = await params;
      setInitialized(false);
      await fetchInitialFeed(4, id || "");
      router.push("/feed");
    };
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToFeed, setFeed, setInitialized]);
}
