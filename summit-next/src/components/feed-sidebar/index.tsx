import { useContext } from "react";
import {
  HiArrowDown,
  HiArrowUp,
  HiOutlineBookmark,
  HiOutlineHeart,
} from "react-icons/hi2";
import { toast } from "sonner";

import { useFeedStore } from "@/lib/stores/useFeedStore";
import { createClient } from "@/lib/supabase/client";
import { eventSchema } from "@/lib/validation/event";

import { UserContext } from "../context/user-context";
import { Button } from "../ui/button";

export function FeedSidebar({
  onIncrement,
  onDecrement,
}: {
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const supabase = createClient();
  const user = useContext(UserContext);
  const { currentPage, feed } = useFeedStore();

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
      user_id: user.id,
      paper_id: paperId,
      event_type: "like",
      payload: {},
    });

    if (!event.success) {
      toast.error("There was an error liking the paper.");
      return;
    }

    const { error } = await supabase.from("event").insert(event.data);

    if (error) {
      toast.error("There was an error liking the paper.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 pr-32">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleLike(feed[currentPage].id as string)}
      >
        <HiOutlineHeart />
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
