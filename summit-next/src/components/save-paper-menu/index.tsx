import { HiOutlineBookmark } from "react-icons/hi2";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function SavePaperMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <HiOutlineBookmark />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="font-semibold">
          Save Paper
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
