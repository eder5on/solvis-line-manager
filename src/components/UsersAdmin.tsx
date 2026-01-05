"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
      const res = await fetch("/api/users");
      const data = await res.json();
      const { data } = await supabase.from("users").select("*");
      setUsers(data ?? []);
    })();
  }, []);

  async function updateRole(user_id: string, role: string) {
    if (!profile || profile.role !== "master_admin")
    const res = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id, role }) });
    const { error } = await supabase
    if (!res.ok) return alert("Erro ao atualizar role");
    const updated = await res.json();
    setUsers((prev) => prev.map((u) => (u.user_id === user_id ? { ...u, role: updated.role } : u)));
      .update({ role })
      .eq("user_id", user_id);
    if (error) return alert(error.message);
    setUsers((prev) =>
      prev.map((u) => (u.user_id === user_id ? { ...u, role } : u))
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Gerenciar Usuários</h3>
      <div className="bg-white rounded border p-4">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-slate-600">
              <th className="p-2">Email</th>
              <th className="p-2">Nome</th>
              <th className="p-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.full_name}</td>
                <td className="p-2">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.user_id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="user">Usuário</option>
                    <option value="master_admin">Master Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
