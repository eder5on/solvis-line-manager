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
  const { data, error } = await supabaseServer
    .from("lines")
    .insert([body])
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data?.[0]);
}
