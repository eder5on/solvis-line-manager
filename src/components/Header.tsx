"use client";
import React from "react";
import { useAuth } from "./AuthProvider";
import { supabase } from "~/supabase/client";
import Link from "next/link";

export default function Header() {
  const { profile } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold">Painel</h3>
      </div>
      <div className="flex items-center gap-3">
        {profile ? (
          <>
            <span className="text-sm">
              {profile.full_name ?? profile.email}
            </span>
            <button
              onClick={async () => await supabase.auth.signOut()}
              className="text-sm px-3 py-1 rounded bg-slate-100 dark:bg-slate-800"
            >
              Sair
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="text-sm px-3 py-1 rounded bg-slate-100 dark:bg-slate-800"
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
