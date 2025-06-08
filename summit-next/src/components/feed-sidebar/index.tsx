import {
  HiArrowDown,
  HiArrowUp,
  HiOutlineBookmark,
  HiOutlineHeart,
} from "react-icons/hi2";

import { useFeedStore } from "@/lib/stores/useFeedStore";

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
        <HiOutlineHeart className={liked ? "text-red-500" : ""} />
      </Button>
      <Button variant="outline" size="icon">
        <HiOutlineBookmark />
      </Button>
      <Button variant="outline" size="icon" onClick={onDecrement}>
        <HiArrowUp />
      </Button>
      <Button variant="outline" size="icon" onClick={onIncrement}>
        <HiArrowDown />
      </Button>
    </div>
  );
}
