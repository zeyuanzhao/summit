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
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          router.push("/auth/login");
        } else if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      },
    );

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
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
