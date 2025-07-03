"use client";

import { DropdownMenuRadioGroup } from "@radix-ui/react-dropdown-menu";
import camelcaseKeys from "camelcase-keys";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiChevronDown } from "react-icons/hi2";
import { toast } from "sonner";
import { z } from "zod";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { List, Paper } from "@/interfaces";
import { createClient } from "@/lib/supabase/client";
import { paperSchema } from "@/lib/validation/paper";

export function ListPage({
  lists,
  listPapers = [],
  id,
}: {
  lists: List[];
  listPapers?: Paper[];
  id: string;
}) {
  const router = useRouter();
  const [currList, setCurrList] = useState<List | null>(
    lists.find((list) => list.id === id) || null,
  );
  const [currPapers, setCurrPapers] = useState<Paper[]>(listPapers);
  const [currId, setCurrId] = useState<string>(id);
  const supabase = createClient();

  const switchList = async (listId: string) => {
    setCurrId(listId);
    setCurrList(lists.find((list) => list.id === listId) || null);
    const newPapersResult = supabase
      .from("list_paper")
      .select("paper(*)")
      .eq("list_id", listId);
    const { data: newPapers, error: errorNewPapers } = await newPapersResult;
    if (errorNewPapers) {
      toast.error("Failed to fetch papers for the selected list.");
      return;
    }
    const zodNewPapers = z
      .array(paperSchema)
      .safeParse(newPapers.map((lp) => camelcaseKeys(lp.paper)));
    if (!zodNewPapers.success) {
      toast.error("Invalid papers data.");
      return;
    }
    setCurrPapers(zodNewPapers.data);
    window.history.pushState(null, "", `/list/${listId}`);
  };

  return (
    <div className="flex max-w-6xl flex-1 flex-col px-28 py-20">
      <div className="relative mb-8 flex min-h-20 flex-col items-start">
        <Link href="/lists" className="absolute -top-6 left-0">
          <p className="text-sm">&larr; Back to Lists</p>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex flex-row items-center gap-1 hover:cursor-pointer">
              <h2 className="text-4xl font-bold">{currList?.title}</h2>
              <HiChevronDown size="20px" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Lists</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={currId} onValueChange={switchList}>
              {lists.map((list) => (
                <DropdownMenuRadioItem key={list.id} value={list.id || ""}>
                  {list.title}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="mt-4">{currList?.description}</p>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead className="text-right">Published</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currPapers.map((paper) => (
              <TableRow
                key={paper.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => router.push(`/feed/${paper.id}`)}
              >
                <TableCell>{paper.title}</TableCell>
                <TableCell>{paper.venue}</TableCell>
                <TableCell className="text-right">
                  {String(paper.publishedDate?.getFullYear())}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
