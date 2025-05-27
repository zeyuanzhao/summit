import Link from "next/link";

import { PaperCardProps } from "@/interfaces";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

export function PaperCard({ id, title, abstract, doi }: PaperCardProps) {
  return (
    <Card className="min-h-[400px] w-[600px]">
      <CardHeader>
        <CardTitle className="text-4xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p>{abstract}</p>
      </CardContent>
      <CardFooter className="flex flex-row justify-between">
        <Button variant="outline" asChild>
          <Link href="/">View Paper</Link>
        </Button>
        <Link href="/">{doi}</Link>
      </CardFooter>
    </Card>
  );
}
