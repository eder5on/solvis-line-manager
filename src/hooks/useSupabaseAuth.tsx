"use client";
import { useEffect } from "react";
import { supabase } from "~/supabase/client";

/**
 * Listens for Supabase auth events and upserts profile to the app `users` table.
 */
export default function useSupabaseAuth() {
  useEffect(() => {
    // Immediately upsert profile if session exists
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const u = data.session.user;
        await fetch("/api/auth/upsert-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: {
              id: u.id,
              email: u.email,
              full_name: u.user_metadata?.full_name ?? u.email,
            },
          }),
        });
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user;
        if (user) {
          await fetch("/api/auth/upsert-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name ?? user.email,
              },
            }),
          });
        }
      }
    );

    return () => sub?.subscription?.unsubscribe?.();
  }, []);
}
