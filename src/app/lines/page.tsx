import React from "react";
import Table from "~/components/Table";

async function fetchLines() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/lines`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function LinesPage() {
  const data = await fetchLines();
  const columns = [
    { key: "number", label: "Número" },
    { key: "operator_real", label: "Operadora Real" },
    { key: "operator_current", label: "Operadora Atual" },
    { key: "client_name", label: "Cliente" },
    { key: "unit_name", label: "Unidade" },
    { key: "monthly_cost", label: "Valor Mensal" },
    { key: "status", label: "Status" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Linhas</h2>
        <div className="flex items-center gap-2">
          <input
            placeholder="Buscar por número"
            className="border rounded px-3 py-2"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Exportar CSV
          </button>
        </div>
      </div>
      <Table columns={columns} data={data || []} />
    </div>
  );
}
