import {
  HiArrowDown,
  HiArrowUp,
  HiOutlineBookmark,
  HiOutlineHeart,
} from "react-icons/hi2";

import { Button } from "../ui/button";

export function FeedSidebar({
  onIncrement,
  onDecrement,
}: {
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 pr-32">
      <Button variant="outline" size="icon">
        <HiOutlineHeart />
      </Button>
      <Button variant="outline" size="icon">
        <HiOutlineBookmark />
      </Button>
      <Button variant="outline" size="icon" onClick={onIncrement}>
        <HiArrowUp />
      </Button>
      <Button variant="outline" size="icon" onClick={onDecrement}>
        <HiArrowDown />
      </Button>
    </div>
  );
}
