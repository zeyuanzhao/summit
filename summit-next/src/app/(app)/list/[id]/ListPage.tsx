"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { List, Paper } from "@/interfaces";

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

  return (
    <div className="flex max-w-6xl flex-1 flex-col px-28 py-20">
      <div className="relative mb-12 flex flex-row items-center justify-between">
        <Link href="/lists" className="absolute -top-6 left-0">
          <p className="text-sm">&larr; Back to Lists</p>
        </Link>
        <h2 className="text-4xl font-bold">{currList?.title}</h2>
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
