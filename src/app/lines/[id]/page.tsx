import React from "react";
import LineTimeline from "~/components/LineTimeline";
import NewMovementForm from "~/components/NewMovementForm";
import InvoiceList from "~/components/InvoiceList";

async function fetchLine(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/lines/${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function LineDetail({
  params,
}: {
  params: { id: string };
}) {
  const line = await fetchLine(params.id);
  if (!line) return <div>Não encontrado</div>;

  const id = params.id;
  return (
    <div>
      <h2 className="text-2xl font-semibold">Linha {line.number}</h2>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white p-4 rounded border">Informações da linha</div>
        <div className="bg-white p-4 rounded border">
          Timeline e movimentações
        </div>
        <div className="col-span-2">
          <div className="bg-white p-4 rounded border mb-4">
            <h3 className="text-lg font-medium">Informações da linha</h3>
            <div className="mt-2 text-sm text-slate-700">
              <div>
                <strong>Operadora real:</strong> {line.operator_real}
              </div>
              <div>
                <strong>Operadora atual:</strong> {line.operator_current}
              </div>
              <div>
                <strong>Cliente:</strong>{" "}
                {line.clients?.name ?? line.client_id ?? "-"}
              </div>
              <div>
                <strong>Unidade:</strong>{" "}
                {line.units?.name ?? line.unit_id ?? "-"}
              </div>
              <div>
                <strong>Valor mensal:</strong> R$ {line.monthly_cost ?? "-"}
              </div>
              <div>
                <strong>Status:</strong> {line.status}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border mb-4">
            <NewMovementForm
              lineId={id}
              onDone={() => {
                /* refresh by client components */
              }}
            />
          </div>

          <div className="bg-white p-4 rounded border">
            <LineTimeline lineId={id} />
          </div>
        </div>

        <aside>
          <div className="bg-white p-4 rounded border mb-4">
            <InvoiceList lineId={id} />
          </div>
        </aside>
      </div>
    </div>
  );
}
