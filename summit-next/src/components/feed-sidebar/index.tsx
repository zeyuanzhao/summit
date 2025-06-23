import { HiArrowDown, HiArrowUp, HiOutlineHeart } from "react-icons/hi2";

import { SavePaperMenu } from "../save-paper-menu";
import { Button } from "../ui/button";

export function FeedSidebar({
  onIncrement = () => {},
  onDecrement = () => {},
  handleLike = async () => {},
  liked = false,
  handleSave = async () => {},
  saved = false,
  paperLists = [],
}: {
  onIncrement?: () => void;
  onDecrement?: () => void;
  handleLike?: () => Promise<void>;
  liked?: boolean;
  handleSave?: (listId: string) => Promise<void>;
  saved?: boolean;
  paperLists?: string[];
}) {
  return (
    <div className="flex flex-col items-center gap-2 pr-32">
      <Button variant="outline" size="icon" onClick={() => handleLike()}>
        <HiOutlineHeart
          color={liked ? "red" : "currentColor"}
          fill={liked ? "red" : "none"}
        />
      </Button>
      <SavePaperMenu
        handleSave={handleSave}
        saved={saved}
        paperLists={paperLists}
      />
      <Button variant="outline" size="icon" onClick={onDecrement}>
        <HiArrowUp />
      </Button>
      <Button variant="outline" size="icon" onClick={onIncrement}>
        <HiArrowDown />
      </Button>
    </div>
  );
}
