import {
  HiArrowDown,
  HiArrowUp,
  HiOutlineBookmark,
  HiOutlineHeart,
} from "react-icons/hi2";

import { Button } from "../ui/button";

export function FeedSidebar() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Button variant="outline" size="icon">
        <HiOutlineHeart />
      </Button>
      <Button variant="outline" size="icon">
        <HiOutlineBookmark />
      </Button>
      <Button variant="outline" size="icon">
        <HiArrowUp />
      </Button>
      <Button variant="outline" size="icon">
        <HiArrowDown />
      </Button>
    </div>
  );
}
