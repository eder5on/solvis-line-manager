"use client";
import React, { useEffect, useState } from "react";

export default function LineTimeline({ lineId }: { lineId: string }) {
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const res = await fetch(`/api/line_movements?line_id=${lineId}`);
    if (!res.ok) return;
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    if (!lineId) return;
    load();
    const listener = (e: any) => {
      if (!e?.detail?.lineId || e.detail.lineId === lineId) load();
    };
    window.addEventListener("movements:changed", listener as EventListener);
    return () =>
      window.removeEventListener(
        "movements:changed",
        listener as EventListener
      );
  }, [lineId]);

  return (
    <div>
      <h4 className="font-semibold mb-2">Timeline</h4>
      <div className="space-y-4">
        {items.length === 0 && (
          <div className="text-sm text-slate-500">
            Nenhuma movimentação ainda
          </div>
        )}
        {items.map((i) => (
          <div key={i.id} className="p-3 bg-slate-50 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{i.type}</div>
                <div className="text-xs text-slate-500">{i.notes}</div>
              </div>
              <div className="text-xs text-slate-400">
                {new Date(i.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
