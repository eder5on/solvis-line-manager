import { NextResponse } from "next/server";
import supabaseServer from "~/lib/supabaseServer";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const { data, error } = await supabaseServer
    .from("lines")
    .select("*, clients(*), units(*)")
    .eq("id", id)
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireMasterAdmin(req);
  if ((auth as any)?.status) return auth;
  const id = params.id;
  const body = await req.json();
  const { data, error } = await supabaseServer
    .from("lines")
    .update(body)
    .eq("id", id)
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data?.[0]);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireMasterAdmin(req);
  if ((auth as any)?.status) return auth;
  const id = params.id;
  const { error } = await supabaseServer.from("lines").delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
