import Link from "next/link";

import { useProfileStore } from "@/lib/stores/useProfileStore";

import { LogoutButton } from "../logout-button";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";

export function Sidebar() {
  const { profile, initialized } = useProfileStore();
  return (
    <div className="relative flex h-full w-52 min-w-52 flex-col p-6 px-4">
      <div className="px absolute left-0 top-0 flex w-full flex-row items-start justify-between p-6 pl-8 pr-4">
        <Link href="/">
          <h1 className="text-2xl font-bold">Summit</h1>
        </Link>
        <div>
          <ThemeToggle />
        </div>
      </div>
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/feed">Feed</Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/profile">Profile</Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/lists">Lists</Link>
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 flex w-full flex-col gap-y-2 p-6 px-4">
        {initialized &&
          (profile ? (
            <>
              <Button variant="ghost" className="w-full justify-start">
                {profile.displayName}
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
            </>
          ))}
      </div>
    </div>
  );
}
