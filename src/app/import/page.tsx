"use client";
import React, { useState } from "react";
import FileUploader from "~/components/FileUploader";
import Papa from "papaparse";

export default function ImportPage() {
  const [preview, setPreview] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [selectedChanges, setSelectedChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  function handleFiles(files: File[]) {
    const f = files[0];
    Papa.parse(f, {
      header: true,
      complete: (results) => setPreview(results.data as any[]),
    });
  }

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/import/lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: preview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao analisar");
      setAnalysis(data);
      // initialize selected changes default to true for divergent items
      const changes: any[] = [];
      (data.new || []).forEach((r: any) => changes.push({ type: "add", number: r.number, data: r, justification: "" }));
      (data.modified || []).forEach((r: any) => changes.push({ type: "update", number: r.number, data: r.new, justification: "" }));
      (data.missing || []).forEach((r: any) => changes.push({ type: "mark_removed", number: r.number, data: r.data, justification: "" }));
      setSelectedChanges(changes);
    } catch (e) {
      alert(String(e));
    } finally {
      setLoading(false);
    }
  }

  function updateChange(idx: number, patch: any) {
    setSelectedChanges((s) => {
      const copy = [...s];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  }

  async function applyChanges() {
    if (!confirm("Aplicar alterações selecionadas? Isso pode editar e criar linhas no banco.")) return;
    setLoading(true);
    try {
      const payload = selectedChanges.filter((c) => c.apply !== false);
      const res = await fetch("/api/import/lines/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: "upload.csv", changes: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao aplicar alterações");
      alert("Importação aplicada com sucesso");
      setPreview([]);
      setAnalysis(null);
      setSelectedChanges([]);
    } catch (e) {
      alert(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Importar Clientes/Unidades</h2>
      <div className="space-y-4">
        <FileUploader onFiles={handleFiles} />
        {preview.length > 0 && (
          <div>
            <h3 className="font-semibold">Pré-visualização</h3>
            <pre className="bg-slate-50 p-3 rounded mt-2 max-h-60 overflow-auto">
              {JSON.stringify(preview.slice(0, 10), null, 2)}
            </pre>
            <div className="flex gap-2 mt-2">
              <button onClick={analyze} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
                Analisar diferenças
              </button>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <h3 className="font-semibold">Resumo da Análise</h3>
            <div>Novas: {analysis.summary.new}</div>
            <div>Modificadas: {analysis.summary.modified}</div>
            <div>Ausentes: {analysis.summary.missing}</div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold">Novas</h4>
                {analysis.new.map((r: any, idx: number) => (
                  <div key={r.number} className="p-2 border rounded mb-2">
                    <div className="font-medium">{r.number}</div>
                    <div className="text-sm">Cliente: {r.client_name}</div>
                    <div className="mt-2">
                      <textarea placeholder="Justificativa (opcional)" className="w-full border p-1" value={selectedChanges.find((c:any)=>c.number===r.number)?.justification||""} onChange={(e)=>{
                        const index = selectedChanges.findIndex((c:any)=>c.number===r.number && c.type==='add');
                        if(index>=0) updateChange(index, { justification: e.target.value, apply:true });
                      }}/>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold">Modificadas</h4>
                {analysis.modified.map((r: any) => (
                  <div key={r.number} className="p-2 border rounded mb-2">
                    <div className="font-medium">{r.number}</div>
                    <div className="text-sm">Diferenças:</div>
                    <pre className="text-xs bg-slate-50 p-1 rounded">{JSON.stringify(r.diffs, null, 2)}</pre>
                    <div className="mt-2">
                      <textarea placeholder="Justificativa" className="w-full border p-1" value={selectedChanges.find((c:any)=>c.number===r.number)?.justification||""} onChange={(e)=>{
                        const index = selectedChanges.findIndex((c:any)=>c.number===r.number && c.type==='update');
                        if(index>=0) updateChange(index, { justification: e.target.value, apply:true });
                      }}/>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold">Ausentes</h4>
                {analysis.missing.map((r: any) => (
                  <div key={r.number} className="p-2 border rounded mb-2">
                    <div className="font-medium">{r.number}</div>
                    <div className="text-sm">Status atual: {r.data.status}</div>
                    <div className="mt-2">
                      <textarea placeholder="Justificativa (por que remover?)" className="w-full border p-1" value={selectedChanges.find((c:any)=>c.number===r.number)?.justification||""} onChange={(e)=>{
                        const index = selectedChanges.findIndex((c:any)=>c.number===r.number && c.type==='mark_removed');
                        if(index>=0) updateChange(index, { justification: e.target.value, apply:true });
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={applyChanges} className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
                Aplicar alterações
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
