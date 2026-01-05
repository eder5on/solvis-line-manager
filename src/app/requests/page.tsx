import React from "react";
import RequestsList from "~/components/RequestsList";

export default function RequestsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Solicitações Pendentes</h2>
      <RequestsList />
    </div>
  );
}
