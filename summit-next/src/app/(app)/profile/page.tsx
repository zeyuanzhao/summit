"use client";

import camelcaseKeys from "camelcase-keys";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { HiUser } from "react-icons/hi2";
import { toast } from "sonner";

import { UserContext } from "@/components/context/user-context";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Paper } from "@/interfaces";
import { useProfileStore } from "@/lib/stores/useProfileStore";
import { createClient } from "@/lib/supabase/client";
import { paperSchema } from "@/lib/validation/paper";

export default function Page() {
  const { profile, initialized, setProfile } = useProfileStore();
  const user = useContext(UserContext);
  const supabase = createClient();
  const [likedPapers, setLikedPapers] = useState<Paper[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchLikedPapers = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("latest_like")
        .select("paper(*)")
        .eq("user_id", user.id)
        .eq("event_type", "like");

      if (error) {
        toast.error("Failed to fetch liked papers.");
        return;
      }

      const zodPapers = paperSchema
        .array()
        .safeParse(data.map((item) => camelcaseKeys(item.paper)));
      if (!zodPapers.success) {
        toast.error("Invalid paper data.");
        return;
      }
      const parsedPapers = zodPapers.data;

      setLikedPapers(parsedPapers);
    };
    if (profile) {
      fetchLikedPapers();
    }
  }, [profile, supabase, user]);

  useEffect(() => {
    document.title = `${profile?.displayName || "Profile"} | Summit`;
  }, [profile]);

  useEffect(() => {
    if (!profile && initialized) {
      router.push("/auth/login");
    }
  }, [profile, initialized, router]);

  if (!initialized || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-row justify-center">
      <div className="flex max-w-6xl flex-1 flex-col px-28 py-20 pt-8">
        <div className="mt-16 flex flex-row items-center gap-x-6">
          <div className="flex h-20 w-20 items-center justify-center overflow-clip rounded-full border border-gray-300">
            {profile?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile!.avatar} alt="Profile Avatar" />
            ) : (
              <HiUser className="mt-4 h-36 w-36" />
            )}
          </div>
          <div>
            <p className="text-4xl font-bold">{profile?.displayName}</p>
            <p className="text-xl text-gray-500">@{profile?.username}</p>
          </div>
          <div className="flex h-full flex-1 flex-row justify-end">
            <EditProfileDialog
              onEdit={(newProfile) => {
                setProfile(newProfile);
              }}
            />
          </div>
        </div>
        <div className="pt-8">
          <div>
            <h2 className="pb-2 text-3xl">
              Liked Papers ({likedPapers.length})
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead className="text-right">Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {likedPapers.map((paper) => (
                  <TableRow
                    key={paper.id}
                    className="hover:bg-muted cursor-pointer"
                    onClick={() => router.push(`/feed/${paper.id}`)}
                  >
                    <TableCell>{paper.title}</TableCell>
                    <TableCell>{paper.venue}</TableCell>
                    <TableCell className="text-right">
                      {String(paper.publishedDate?.getFullYear())}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
