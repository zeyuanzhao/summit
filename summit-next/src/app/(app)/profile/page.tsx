"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiUser } from "react-icons/hi2";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/lib/stores/useProfileStore";

export default function Page() {
  const { profile, initialized } = useProfileStore();
  const router = useRouter();

  if (!initialized) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile && initialized) {
    toast.error("You must be logged in to view this page.");
    router.push("/login");
  }

  return (
    <div className="flex flex-1 flex-row justify-center">
      <div className="flex max-w-6xl flex-1 flex-col px-28 py-20 pt-8">
        <div className="mt-16 flex flex-row items-center gap-x-6">
          <div className="flex h-20 w-20 items-center justify-center overflow-clip rounded-full border border-gray-300">
            {profile!.avatar ? (
              <Image src={profile!.avatar} alt="Profile Avatar" className="" />
            ) : (
              <HiUser className="mt-4 h-36 w-36" />
            )}
          </div>
          <div>
            <p className="text-4xl font-bold">{profile!.displayName}</p>
            <p className="text-xl text-gray-500">@{profile!.username}</p>
          </div>
          <div className="flex h-full flex-1 flex-row justify-end">
            <Button variant="outline">Edit Profile</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
