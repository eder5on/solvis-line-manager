"use client";
import React, { useState } from "react";

export default function AddLineForm() {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [operatorReal, setOperatorReal] = useState("");
  const [operatorCurrent, setOperatorCurrent] = useState("");
  const [clientName, setClientName] = useState("");
  const [unitName, setUnitName] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [status, setStatus] = useState("Ativa");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const body = {
        number,
        operator_real: operatorReal,
        operator_current: operatorCurrent,
        client_name: clientName,
        unit_name: unitName,
        monthly_cost: monthlyCost || null,
        status,
      };
      const res = await fetch("/api/lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao criar a linha");
      alert("Linha criada com sucesso");
      setOpen(false);
      // reset
      setNumber("");
      setOperatorReal("");
      setOperatorCurrent("");
      setClientName("");
      setUnitName("");
      setMonthlyCost("");
      setStatus("Ativa");
      // notify
      try { window.dispatchEvent(new CustomEvent('lines:changed')); } catch(e){}
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} className="px-3 py-2 bg-blue-600 text-white rounded">
        {open ? "Cancelar" : "Adicionar Linha"}
      </button>
      {open && (
        <div className="mt-3 p-3 border rounded bg-white">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Número" value={number} onChange={(e)=>setNumber(e.target.value)} className="border px-2 py-1" />
            <input placeholder="Operadora Real" value={operatorReal} onChange={(e)=>setOperatorReal(e.target.value)} className="border px-2 py-1" />
            <input placeholder="Operadora Atual" value={operatorCurrent} onChange={(e)=>setOperatorCurrent(e.target.value)} className="border px-2 py-1" />
            <input placeholder="Cliente (nome)" value={clientName} onChange={(e)=>setClientName(e.target.value)} className="border px-2 py-1" />
            <input placeholder="Unidade (nome)" value={unitName} onChange={(e)=>setUnitName(e.target.value)} className="border px-2 py-1" />
            <input placeholder="Valor Mensal" value={monthlyCost} onChange={(e)=>setMonthlyCost(e.target.value)} className="border px-2 py-1" />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={submit} disabled={loading || !number} className="px-3 py-2 bg-green-600 text-white rounded">Salvar</button>
            <button onClick={()=>setOpen(false)} className="px-3 py-2 bg-slate-200 rounded">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
