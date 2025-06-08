import { HiArrowDown, HiArrowUp, HiOutlineHeart } from "react-icons/hi2";

import { useFeedStore } from "@/lib/stores/useFeedStore";

import { SavePaperMenu } from "../save-paper-menu";
import { Button } from "../ui/button";

export function FeedSidebar({
  onIncrement = () => {},
  onDecrement = () => {},
  handleLike = async () => {},
  liked = false,
}: {
  onIncrement?: () => void;
  onDecrement?: () => void;
  handleLike?: (paperId: string) => Promise<void>;
  liked?: boolean;
}) {
  const { currentPage, feed } = useFeedStore();

  return (
    <div className="flex flex-col items-center gap-2 pr-32">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleLike(feed[currentPage].id as string)}
      >
        <HiOutlineHeart
          color={liked ? "red" : "currentColor"}
          fill={liked ? "red" : "none"}
        />
      </Button>
      <SavePaperMenu />
      <Button variant="outline" size="icon" onClick={onDecrement}>
        <HiArrowUp />
      </Button>
      <Button variant="outline" size="icon" onClick={onIncrement}>
        <HiArrowDown />
      </Button>
    </div>
  );
}
