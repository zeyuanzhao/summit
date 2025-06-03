"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((user) => {
      if (user.data && user.data.user) {
        router.push("/");
      }
    });
  }, [router]);

  return children;
}
