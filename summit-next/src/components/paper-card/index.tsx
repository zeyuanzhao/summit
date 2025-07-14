import { TabsContent } from "@radix-ui/react-tabs";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Paper } from "@/interfaces";
import { urlForPaper } from "@/lib/paper";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export function PaperCard({
  id,
  title,
  abstract,
  canonicalId,
  className,
  ref,
  summary,
}: Paper & { className?: string; ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Card className={`${className}`} ref={ref}>
      <CardHeader>
        <CardTitle className="text-4xl">{title}</CardTitle>
        {/* <p className="text-muted-foreground text-sm">Paper ID: {id}</p> */}
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <Tabs
          defaultValue={summary ? "summary" : "abstract"}
          className="h-full"
        >
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="abstract">Abstract</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="prose dark:prose-invert">
            <Markdown remarkPlugins={[remarkGfm]}>{summary}</Markdown>
          </TabsContent>
          <TabsContent value="abstract" className="prose dark:prose-invert">
            <Markdown remarkPlugins={[remarkGfm]}>{abstract}</Markdown>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-row justify-between">
        <Button variant="outline" asChild>
          <Link href={`/paper/${id}`}>View Paper</Link>
        </Button>
        <Link
          href={urlForPaper(canonicalId)}
          target="_blank"
          className="hover:underline"
        >
          {canonicalId}
        </Link>
      </CardFooter>
    </Card>
  );
}
