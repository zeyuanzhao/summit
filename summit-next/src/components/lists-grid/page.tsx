"use client";

import { List } from "@/interfaces";

import { ListCard } from "../list-card";

export function ListsGrid({ lists }: { lists: List[] }) {
  return (
    <div>
      {lists && lists.length > 0 ? (
        <div className="grid">
          {lists.map((list) => (
            <ListCard className="h-40 w-96" {...list} key={list.id} />
          ))}
        </div>
      ) : (
        <p>You don&apos;t have any lists yet.</p>
      )}
    </div>
  );
}
