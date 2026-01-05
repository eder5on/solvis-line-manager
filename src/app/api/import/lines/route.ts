import { NextResponse } from "next/server";
import supabaseServer from "~/lib/supabaseServer";
import Papa from "papaparse";

function normalizeRow(r: any) {
  return {
    number: (r.number || r.Número || r.Numero || r.Number || r.Numbero || r.numero || r.NUMBER || r.número || r["Número"] || r["Número "])?.toString()?.trim?.() || (r.Number || r.number)?.toString()?.trim?.(),
    operator_real: (r.operator_real || r.operadora_real || r.operadora || r.Operator || r.operator || r.OperatorReal) || "",
    operator_current: (r.operator_current || r.operadora_atual || r.operator_current) || "",
    client_name: (r.client || r.Cliente || r.Client || r.client_name) || "",
    unit_name: (r.unit || r.Unidade || r.Unit || r.unit_name) || "",
    monthly_cost: (r.monthly_cost || r.valor || r."Valor Mensal" || r.monthly_cost) || null,
    status: (r.status || r.Status) || "Ativa",
    raw: r,
  };
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  let rows: any[] = [];

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    const text = await file.text();
    const parsed = Papa.parse(text, { header: true });
    rows = parsed.data as any[];
  } else {
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.rows)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    rows = body.rows;
  }

  const normalized = rows.map(normalizeRow).filter((r) => r.number);
  // fetch existing lines
  const { data: existing } = await supabaseServer
    .from("lines")
    .select("id,number,operator_real,operator_current,monthly_cost,status,clients(name),units(name)");

  const existingMap: Record<string, any> = {};
  (existing || []).forEach((e: any) => {
    existingMap[e.number] = e;
  });

  const csvNumbers = new Set(normalized.map((r) => r.number));

  const newRows: any[] = [];
  const modified: any[] = [];

  for (const r of normalized) {
    const ex = existingMap[r.number];
    if (!ex) {
      newRows.push(r);
      continue;
    }
    // compare relevant fields
    const diffs: any = {};
    if ((ex.operator_real || "") !== (r.operator_real || "")) diffs.operator_real = { old: ex.operator_real, new: r.operator_real };
    if ((ex.operator_current || "") !== (r.operator_current || "")) diffs.operator_current = { old: ex.operator_current, new: r.operator_current };
    const exClient = ex.clients?.[0]?.name || "";
    if ((exClient || "") !== (r.client_name || "")) diffs.client_name = { old: exClient, new: r.client_name };
    const exUnit = ex.units?.[0]?.name || "";
    if ((exUnit || "") !== (r.unit_name || "")) diffs.unit_name = { old: exUnit, new: r.unit_name };
    const exCost = ex.monthly_cost ? ex.monthly_cost.toString() : "";
    if ((r.monthly_cost || "") && exCost !== r.monthly_cost.toString()) diffs.monthly_cost = { old: exCost, new: r.monthly_cost };
    if ((ex.status || "") !== (r.status || "")) diffs.status = { old: ex.status, new: r.status };

    if (Object.keys(diffs).length > 0) {
      modified.push({ number: r.number, diffs, old: ex, new: r });
    }
  }

  const missing = (existing || []).filter((e: any) => !csvNumbers.has(e.number)).map((e: any) => ({ number: e.number, data: e }));

  return NextResponse.json({ ok: true, summary: { new: newRows.length, modified: modified.length, missing: missing.length }, new: newRows, modified, missing });
}
