import React from "react";
import DashboardCharts from "~/components/DashboardCharts";

const sampleOperators = [
  { name: "Claro", value: 40 },
  { name: "Vivo", value: 30 },
  { name: "Tim", value: 20 },
  { name: "Salvy", value: 5 },
  { name: "Datatem", value: 5 },
];

export default function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <section className="col-span-2 bg-white p-4 rounded border">
        <h3 className="text-lg font-semibold mb-4">KPIs</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded">
            Total de Linhas
            <br />
            <strong>1.234</strong>
          </div>
          <div className="p-4 bg-slate-50 rounded">
            Custo Mensal
            <br />
            <strong>R$ 42.345,00</strong>
          </div>
          <div className="p-4 bg-slate-50 rounded">
            Elegíveis para Cancelamento
            <br />
            <strong>45</strong>
          </div>
        </div>
      </section>
      <section className="bg-white p-4 rounded border">
        <h3 className="text-lg font-semibold mb-4">
          Distribuição por Operadora
        </h3>
        <DashboardCharts data={sampleOperators} />
      </section>
    </div>
  );
}
