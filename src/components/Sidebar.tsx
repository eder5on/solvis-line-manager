"use client";
import Link from "next/link";
import { Home, Layers, FilePlus, Users, Settings } from "lucide-react";
import { useAuth } from "./AuthProvider";

export default function Sidebar() {
  const { profile } = useAuth();

  return (
    <aside className="w-72 border-r border-slate-200 dark:border-slate-800 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Solvis</h2>
        <p className="text-sm text-slate-500">Line Manager</p>
      </div>
      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Home size={16} /> <span>Dashboard</span>
        </Link>
        <Link
          href="/lines"
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Layers size={16} /> <span>Linhas</span>
        </Link>
        <Link
          href="/import"
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <FilePlus size={16} /> <span>Importar Clientes</span>
        </Link>
        <Link
          href="/requests"
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Users size={16} /> <span>Solicitações</span>
        </Link>
        {profile?.role === "master_admin" && (
          <Link
            href="/settings"
            className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Settings size={16} /> <span>Configurações</span>
          </Link>
        )}
      </nav>
    </aside>
  );
}
