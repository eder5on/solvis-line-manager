"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

export default function RequestsList() {
  const [requests, setRequests] = useState<any[]>([]);
  const [lineId, setLineId] = useState("");
  const [type, setType] = useState("Suspender");
  const [notes, setNotes] = useState("");
  const { profile } = useAuth();

  async function fetchRequests() {
    const res = await fetch("/api/requests");
    if (!res.ok) return;
    const data = await res.json();
    setRequests(data);
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  async function createRequest() {
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ line_id: lineId, type, notes }),
    });
    if (!res.ok) return alert("Erro ao criar");
    setLineId("");
    setNotes("");
    fetchRequests();
  }

  async function conclude(id: string) {
    const res = await fetch("/api/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "Concluido" }),
    });
    if (!res.ok) return alert("Erro ao concluir");
    fetchRequests();
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Solicitações Pendentes</h3>
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex gap-2">
          <input
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
            placeholder="Line ID"
            className="border px-2 py-1"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border px-2 py-1"
          >
            <option>Suspender</option>
            <option>Cancelar</option>
            <option>Reativar</option>
            <option>Outro</option>
          </select>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observação"
            className="border px-2 py-1 flex-1"
          />
          <button
            onClick={createRequest}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Enviar
          </button>
        </div>
      </div>

      <div className="bg-white rounded border p-4">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-slate-600">
              <th className="p-2">Linha</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Notas</th>
              <th className="p-2">Status</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.lines?.number ?? r.line_id}</td>
                <td className="p-2">{r.type}</td>
                <td className="p-2">{r.notes}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">
                  {profile?.role === "master_admin" ? (
                    <button
                      onClick={() => conclude(r.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Concluir ação
                    </button>
                  ) : (
                    <span className="text-sm text-slate-500">Aguardando</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
