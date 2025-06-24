import { ListCard } from "@/components/list-card";
import { Button } from "@/components/ui/button";
import { List } from "@/interfaces";

export function ListsPage({ lists }: { lists: List[] }) {
  return (
    <div className="flex max-w-6xl flex-1 flex-col px-28 py-20">
      <div className="mb-12 flex flex-row items-center justify-between">
        <h2 className="text-4xl font-bold">Lists</h2>
        <Button variant="outline">Create List</Button>
      </div>
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
    </div>
  );
}
