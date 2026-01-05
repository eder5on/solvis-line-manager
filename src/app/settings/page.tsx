import React from "react";
import UsersAdmin from "~/components/UsersAdmin";

export default function SettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Configurações</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded border">
          <UsersAdmin />
        </div>
        <div className="bg-white p-4 rounded border">
          Critérios de cancelamento (a implementar)
        </div>
      </div>
    </div>
  );
}
