"use client";

import { useState } from "react";

import { CreateListDialog } from "@/components/create-list-dialog";
import { ListCard } from "@/components/list-card";
import { List } from "@/interfaces";

export function ListsPage({ lists }: { lists: List[] }) {
  const [currLists, setCurrLists] = useState<List[]>(lists);

  return (
    <div className="flex max-w-6xl flex-1 flex-col px-28 py-20">
      <div className="mb-12 flex flex-row items-center justify-between">
        <h2 className="text-4xl font-bold">Lists</h2>
        <CreateListDialog
          onCreate={(list) => setCurrLists([...currLists, list])}
        />
      </div>
      <div>
        {currLists && currLists.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {currLists.map((list) => (
              <ListCard className="h-40 w-96" {...list} key={list.id} />
            ))}
          </div>
        ) : (
          <p>You don&apos;t have any lists yet.</p>
        )}
      </div>
    </div>
  );
}
