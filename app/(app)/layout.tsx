"use client";

import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { UserContext } from "@/components/context/user-context";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/client";

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.push("/auth/login");
      } else {
        setUser(data.user);
      }
    });
  }, [router]);

  return (
    <UserContext.Provider value={user}>
      <div className="flex h-screen w-screen flex-row">
        <Sidebar />
        {children}
      </div>
    </UserContext.Provider>
  );
}
