"use client";

import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Paper, Tag } from "@/interfaces";

export function TagPage({ tag, papers }: { tag: Tag; papers: Paper[] }) {
  const router = useRouter();
  return (
    <div className="flex flex-1 flex-row justify-center">
      <div className="flex max-w-6xl flex-1 flex-col px-28 py-20 pt-8">
        <div className="mb-12 mt-16 flex flex-row items-center justify-between">
          <h2 className="text-4xl font-bold">Papers with tag: {tag.name}</h2>
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
              {papers.map((paper) => (
                <TableRow
                  key={paper.id}
                  className="hover:bg-muted cursor-pointer"
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
    </div>
  );
}
