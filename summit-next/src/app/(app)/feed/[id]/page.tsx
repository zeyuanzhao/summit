"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useFeedStore } from "@/lib/stores/useFeedStore";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { addToFeed, initialized, fetchInitialFeed } = useFeedStore();
  const router = useRouter();

  useEffect(() => {
    const fetchFeed = async () => {
      const { id } = await params;
      await fetchInitialFeed(4, id || "");
      router.push("/feed");
    };
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToFeed, initialized]);
}
