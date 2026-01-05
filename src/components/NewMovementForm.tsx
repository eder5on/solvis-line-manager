"use client";
import React, { useState } from "react";

export default function NewMovementForm({
  lineId,
  onDone,
}: {
  lineId: string;
  onDone?: () => void;
}) {
  const [type, setType] = useState("Suspensão");
  const [notes, setNotes] = useState("");

  async function submit() {
    const res = await fetch(`/api/line_movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ line_id: lineId, type, notes }),
    });
    if (!res.ok) return alert("Erro ao registrar movimentação");
    setNotes("");
    // signal other components to refresh
    try {
      window.dispatchEvent(
        new CustomEvent("movements:changed", { detail: { lineId } })
      );
    } catch (e) {}
    if (onDone) onDone();
  }

  return (
    <div className="bg-white p-4 rounded border">
      <h4 className="font-semibold mb-2">Nova Movimentação</h4>
      <div className="flex gap-2 items-center">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border px-2 py-1"
        >
          <option>Suspensão</option>
          <option>Cancelamento</option>
          <option>Resgate</option>
          <option>Nova aquisição</option>
          <option>Outro</option>
        </select>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações"
          className="border px-2 py-1 flex-1"
        />
        <button
          onClick={submit}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Registrar
        </button>
      </div>
    </div>
  );
}
