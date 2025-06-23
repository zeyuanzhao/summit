import { useContext, useState } from "react";
import { HiOutlineBookmark } from "react-icons/hi2";

import { useListStore } from "@/lib/stores/useListStore";

import { UserContext } from "../context/user-context";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function SavePaperMenu({
  handleSave = async () => {},
  saved = false,
  paperLists = [],
}: {
  handleSave?: (listId: string) => Promise<void>;
  saved?: boolean;
  paperLists?: string[];
}) {
  const { getLists, lists, initialized } = useListStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useContext(UserContext);

  const handleOpenChange = async (nextOpen: boolean) => {
    if (nextOpen && !initialized) {
      setLoading(true);
      await getLists(user?.id || null);
      setLoading(false);
    }
    if (nextOpen && !user) {
      return;
    }
    setOpen(nextOpen);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <HiOutlineBookmark
            color={saved ? "red" : "currentColor"}
            fill={saved ? "red" : "none"}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        <DropdownMenuLabel className="font-semibold">
          Save Paper
        </DropdownMenuLabel>
        {loading && (
          <DropdownMenuItem disabled>Loading lists...</DropdownMenuItem>
        )}
        {!loading && !lists.length && (
          <DropdownMenuItem disabled>No lists available</DropdownMenuItem>
        )}
        {!loading &&
          lists.map((list) => (
            <DropdownMenuCheckboxItem
              key={list.id}
              checked={paperLists.includes(list.id || "")}
              onCheckedChange={() => handleSave(list.id || "")}
            >
              {list.title}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
