import Link from "next/link";
import { Button } from "./ui/button";

export function Sidebar() {
  return (
    <div className="w-48 h-full p-6 pl-4 flex flex-col relative">
      <div className="absolute top-0 left-0 w-full p-6 pl-8">
        <Link href="/">
          <h1 className="font-bold text-2xl">Summit</h1>
        </Link>
      </div>
      <div className="flex flex-col items-center gap-2 justify-center h-full">
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
      <div className="absolute bottom-0 left-0 w-full p-6">
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
