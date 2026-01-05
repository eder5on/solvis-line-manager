"use client";
import React, { useState } from "react";
import FileUploader from "~/components/FileUploader";
import Papa from "papaparse";

export default function ImportPage() {
  const [preview, setPreview] = useState<any[]>([]);

  function handleFiles(files: File[]) {
    const f = files[0];
    Papa.parse(f, {
      header: true,
      complete: (results) => setPreview(results.data as any[]),
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Importar Clientes/Unidades
      </h2>
      <div className="space-y-4">
        <FileUploader onFiles={handleFiles} />
        {preview.length > 0 && (
          <div>
            <h3 className="font-semibold">Pré-visualização</h3>
            <pre className="bg-slate-50 p-3 rounded mt-2 max-h-60 overflow-auto">
              {JSON.stringify(preview.slice(0, 10), null, 2)}
            </pre>
            <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded">
              Salvar importação
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
