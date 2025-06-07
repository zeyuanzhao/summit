import Link from "next/link";

import { List } from "@/interfaces";

import { Card, CardContent, CardHeader } from "../ui/card";

export function ListCard({
  title,
  description,
  id,
  className = "",
}: List & { className?: string }) {
  return (
    <Link href={`/list/${id}`} className="no-underline">
      <Card className={className}>
        <CardHeader>
          <p className="text-2xl font-bold">{title}</p>
        </CardHeader>
        <CardContent className="overflow-hidden text-ellipsis">
          <p className="">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
