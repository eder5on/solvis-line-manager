"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "~/supabase/client";
import useSupabaseAuth from "~/hooks/useSupabaseAuth";

type Profile = {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  role?: string;
} | null;

const UserContext = createContext<{
  user: any | null;
  profile: Profile;
  refresh: () => Promise<void>;
}>({ user: null, profile: null, refresh: async () => {} });

export function useAuth() {
  return useContext(UserContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useSupabaseAuth();
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile>(null);

  async function refresh() {
    const { data } = await supabase.auth.getSession();
    const u = data?.session?.user ?? null;
    setUser(u);

    if (!u) {
      setProfile(null);
      return;
    }

    const { data: p } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", u.id)
      .limit(1)
      .maybeSingle();
    setProfile(p ?? null);
  }

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, refresh }}>
      {children}
    </UserContext.Provider>
  );
}
