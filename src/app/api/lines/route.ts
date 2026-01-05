import { NextResponse } from "next/server";
import supabaseServer from "~/lib/supabaseServer";
import { requireMasterAdmin } from "~/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const { data, error } = await supabaseServer
    .from("lines")
    .select(`*, clients(name), units(name)`)
    .ilike("number", `%${q ?? ""}%`)
    .limit(200);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const payload = (data || []).map((r: any) => ({
    ...r,
    client_name: r.clients?.name ?? null,
    unit_name: r.units?.name ?? null,
  }));

  return NextResponse.json(payload);
}

export async function POST(req: Request) {
  const auth = await requireMasterAdmin(req);
  if ((auth as any)?.status) return auth;

  const body = await req.json();

  // resolve client by name if provided
  let clientId = body.client_id ?? null;
  if (!clientId && body.client_name) {
    const name = body.client_name;
    const { data: existing } = await supabaseServer.from("clients").select("id").ilike("name", name).limit(1);
    clientId = existing && existing[0] && existing[0].id;
    if (!clientId) {
      const { data: inserted } = await supabaseServer.from("clients").insert([{ name }]).select().limit(1).maybeSingle();
      clientId = inserted?.id;
    }
  }

  // resolve unit by name if provided and clientId is present
  let unitId = body.unit_id ?? null;
  if (!unitId && body.unit_name && clientId) {
    const unitName = body.unit_name;
    const { data: existingUnit } = await supabaseServer
      .from("units")
      .select("id")
      .eq("client_id", clientId)
      .ilike("name", unitName)
      .limit(1);
    unitId = existingUnit && existingUnit[0] && existingUnit[0].id;
    if (!unitId) {
      const { data: insertedU } = await supabaseServer
        .from("units")
        .insert([{ client_id: clientId, name: unitName }])
        .select()
        .limit(1)
        .maybeSingle();
      unitId = insertedU?.id;
    }
  }

  const insertBody: any = {
    number: body.number,
    operator_real: body.operator_real || body.operator || "",
    operator_current: body.operator_current || body.operator_current || body.operator || "",
    client_id: clientId || null,
    unit_id: unitId || null,
    monthly_cost: body.monthly_cost || null,
    status: body.status || "Ativa",
  };

  const { data, error } = await supabaseServer
    .from("lines")
    .insert([insertBody])
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data?.[0]);
}
