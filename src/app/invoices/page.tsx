"use client";
import React, { useState } from "react";
import FileUploader from "~/components/FileUploader";

export default function InvoicesPage() {
  const [lineId, setLineId] = useState("");
  const [amount, setAmount] = useState("");

  async function handleFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("line_id", lineId);
    form.append("amount", amount);

    const res = await fetch("/api/invoices", { method: "POST", body: form });
    if (!res.ok) return alert("Erro ao enviar fatura");
    const data = await res.json();
    alert("Fatura enviada com sucesso");
    try {
      window.dispatchEvent(
        new CustomEvent("invoices:changed", { detail: { lineId } })
      );
    } catch (e) {}
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Faturas</h2>
      <div className="bg-white p-4 rounded border mb-4">
        <div className="flex gap-2 mb-3">
          <input
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
            placeholder="Line ID"
            className="border px-2 py-1"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Valor da fatura"
            className="border px-2 py-1"
          />
        </div>
        <FileUploader onFiles={handleFiles} />
      </div>
      <div className="bg-white p-4 rounded border">
        Lista de faturas (a implementar)
      </div>
    </div>
  );
}
