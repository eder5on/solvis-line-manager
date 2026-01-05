import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

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
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={sampleOperators}
                dataKey="value"
                nameKey="name"
                outerRadius={60}
                fill="#8884d8"
              >
                {sampleOperators.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"][
                        index % 5
                      ]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
