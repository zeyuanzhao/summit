"use client";

import { useContext, useState } from "react";
import { HiOutlineHeart } from "react-icons/hi2";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

import { UserContext } from "../context/user-context";
import { Button } from "../ui/button";

export function LikePaperButton({
  paperId,
  liked = false,
  onLike,
}: {
  paperId?: string;
  liked?: boolean;
  onLike?: (id: string) => void;
}) {
  const user = useContext(UserContext);
  const [likedState, setLikedState] = useState(liked);
  const defaultOnLike = async (id: string) => {
    const supabase = createClient();
    if (!user?.id) {
      toast.error("You must be logged in to like a paper.");
      return;
    }
    const { error } = await supabase.from("event").insert({
      user_id: user?.id,
      paper_id: id,
      event_type: likedState ? "unlike" : "like",
    });
    if (error) {
      toast.error("Failed to like the paper.");
    }
    setLikedState(!likedState);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() =>
        paperId && (onLike ? onLike(paperId) : defaultOnLike(paperId))
      }
    >
      <HiOutlineHeart
        color={likedState ? "red" : "currentColor"}
        fill={likedState ? "red" : "none"}
      />
    </Button>
  );
}
