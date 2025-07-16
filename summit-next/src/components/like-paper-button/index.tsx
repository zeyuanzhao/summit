"use client";

import { HiOutlineHeart } from "react-icons/hi2";

import { Button } from "../ui/button";

export function LikePaperButton({
  liked = false,
  onLike,
}: {
  liked?: boolean;
  onLike?: () => void;
}) {
  return (
    <Button variant="outline" size="icon" onClick={onLike}>
      <HiOutlineHeart
        color={liked ? "red" : "currentColor"}
        fill={liked ? "red" : "none"}
      />
    </Button>
  );
}
