import { NextResponse } from "next/server";
import supabaseServer from "~/lib/supabaseServer";
import { getUserFromRequest, requireAuth } from "~/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const line_id = url.searchParams.get("line_id");
  if (!line_id) return NextResponse.json([], { status: 200 });

  const { data, error } = await supabaseServer
    .from("line_movements")
    .select("*, users:user_id(email, full_name)")
    .eq("line_id", line_id)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if ((auth as any)?.status) return auth;
  const { user } = auth as any;

  const body = await req.json();
  const payload = {
    line_id: body.line_id,
    type: body.type,
    user_id: user.id,
    notes: body.notes ?? null,
  };

  const { data, error } = await supabaseServer
    .from("line_movements")
    .insert([payload])
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data?.[0]);
}
