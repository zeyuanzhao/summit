"use client";

import ListCard from "@/components/list-card";
import { Button } from "@/components/ui/button";
import { ListCardProps } from "@/interfaces";
import { useState } from "react";

export default function Page() {
  const [lists, setLists] = useState<ListCardProps[]>([]);
  return (
    <div className="flex flex-1 flex-row justify-around">
      <div className="flex max-w-6xl flex-1 flex-col px-28 py-20">
        <div className="mb-12 flex flex-row items-center justify-between">
          <h2 className="text-4xl font-bold">Lists</h2>
          <Button variant="outline">Create List</Button>
        </div>
        <div className="grid">
          <ListCard
            title={"List 1"}
            description={
              "TestTestTestTestTestTestTestTest Test Test Test Test Test Test Test Test Test Test Test Test Test overflow-hidden overflow-hidden overflow-hidden overflow-hidden overflow-hidden overflow-hidden overflow-hidden  Test Test Test Test Test Test Test Test Test Test Test"
            }
            id={"123"}
            className="h-40 w-96"
          />
        </div>
      </div>
    </div>
  );
}
