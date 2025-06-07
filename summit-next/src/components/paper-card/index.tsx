import Link from "next/link";

import { Paper } from "@/interfaces";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

export function PaperCard({
  id,
  title,
  abstract,
  canonical_id: doi,
  className,
  ref,
}: Paper & { className?: string; ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Card className={`${className}`} ref={ref}>
      <CardHeader>
        <CardTitle className="text-4xl">{title}</CardTitle>
        <p className="text-muted-foreground text-sm">Paper ID: {id}</p>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <p>{abstract}</p>
      </CardContent>
      <CardFooter className="flex flex-row justify-between">
        <Button variant="outline" asChild>
          <Link href={`/paper/${id}`}>View Paper</Link>
        </Button>
        <Link href={`https://doi.org/${doi}`} target="_blank">
          {doi}
        </Link>
      </CardFooter>
    </Card>
  );
}
