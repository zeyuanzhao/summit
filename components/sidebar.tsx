import Link from "next/link";

import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

export function Sidebar() {
  return (
    <div className="relative flex h-full w-52 flex-col p-6 pr-2 pl-4">
      <div className="absolute top-0 left-0 flex w-full flex-row items-start justify-between p-6 pl-8">
        <Link href="/">
          <h1 className="text-2xl font-bold">Summit</h1>
        </Link>
        <div>
          <ThemeToggle />
        </div>
      </div>
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <Button variant="ghost" className="w-full justify-start">
          Feed
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Profile
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Lists
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 flex w-full flex-col gap-2 p-6">
        <Button variant="outline" className="w-full">
          Sign Up
        </Button>
        <Button variant="ghost" className="w-full">
          Log In
        </Button>
      </div>
    </div>
  );
}
