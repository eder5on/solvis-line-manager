"use client";
import React, { useEffect, useState } from "react";

export default function InvoiceList({ lineId }: { lineId: string }) {
  const [invoices, setInvoices] = useState<any[]>([]);

  async function load() {
    const res = await fetch(`/api/invoices?line_id=${lineId}`);
    if (!res.ok) return;
    const data = await res.json();
    setInvoices(data);
  }

  useEffect(() => {
    if (!lineId) return;
    load();
    const onInvoices = (e: any) => {
      if (!e?.detail?.lineId || e.detail.lineId === lineId) load();
    };
    window.addEventListener("invoices:changed", onInvoices as EventListener);
    return () =>
      window.removeEventListener(
        "invoices:changed",
        onInvoices as EventListener
      );
  }, [lineId]);

  return (
    <div>
      <h4 className="font-semibold mb-2">Faturas</h4>
      <div className="space-y-3">
        {invoices.length === 0 && (
          <div className="text-sm text-slate-500">Nenhuma fatura enviada</div>
        )}
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="p-3 bg-slate-50 rounded border flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-medium">R$ {inv.amount ?? "-"}</div>
              <div className="text-xs text-slate-500">
                Enviado:{" "}
                {inv.uploaded_at
                  ? new Date(inv.uploaded_at).toLocaleString()
                  : "-"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {inv.signed_url ? (
                <a
                  href={inv.signed_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-slate-800 text-white rounded"
                >
                  Ver
                </a>
              ) : (
                <span className="text-sm text-slate-500">
                  Preview indisponível
                </span>
              )}
              <a
                href={inv.signed_url}
                download
                className="px-3 py-1 bg-slate-100 rounded"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
