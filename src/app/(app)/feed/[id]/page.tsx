"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { FeedSidebar } from "@/components/feed-sidebar";
import { PaperCard } from "@/components/paper-card";
import { useFeedStore } from "@/lib/stores/useFeedStore";

export default function Page() {
  const { feed, currentPage, addToFeed } = useFeedStore();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch("/feed/fetch");
        if (!data.ok) {
          const errorData = await data.json();
          throw new Error(errorData.error || "Failed to fetch feed data");
        }
        addToFeed(await data.json());
      } catch (e) {
        toast.error(
          (e as Error).message || "An error occurred while fetching feed data",
        );
      }
    };
    fetchData();
  }, [addToFeed, currentPage]);

  return (
    <div className="flex h-screen flex-1 flex-row items-center justify-center gap-40">
      {/* <PaperCard
        id="1"
        title="Attention Is All You Need"
        abstract="The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature. We show that the Transformer generalizes well to other tasks by applying it successfully to English constituency parsing both with large and limited training data."
        doi="10.48550/arXiv.1706.03762"
      /> */}
      <div>
        {feed.map((paper) => (
          <PaperCard
            key={paper.id}
            id={paper.id}
            title={paper.title}
            abstract={paper.abstract}
            doi={paper.doi}
          />
        ))}
      </div>
      <FeedSidebar />
    </div>
  );
}
