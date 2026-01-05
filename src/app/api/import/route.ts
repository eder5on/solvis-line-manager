import { NextResponse } from "next/server";
import supabaseServer from "~/lib/supabaseServer";
import Papa from "papaparse";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file)
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });

  const text = await file.text();
  const parsed = Papa.parse(text, { header: true });
  const rows = parsed.data as any[];

  // Map simple insert: if client not exists, insert
  for (const r of rows) {
    if (!r.Cliente) continue;
    const name = r.Cliente;
    const { data: existing } = await supabaseServer
      .from("clients")
      .select("id")
      .ilike("name", name)
      .limit(1);
    let clientId = existing && existing[0] && existing[0].id;
    if (!clientId) {
      const { data } = await supabaseServer
        .from("clients")
        .insert([{ name }])
        .select();
      clientId = data?.[0]?.id;
    }
    if (r.Unidade) {
      const unitName = r.Unidade;
      const { data: units } = await supabaseServer
        .from("units")
        .insert([{ client_id: clientId, name: unitName }])
        .select();
    }
  }

  return NextResponse.json({ ok: true, inserted: rows.length });
}
