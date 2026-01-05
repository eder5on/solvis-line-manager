import { NextResponse } from "next/server";
import supabaseServer from "~/lib/supabaseServer";
import { requireMasterAdmin } from "~/lib/auth";

export async function GET(req: Request) {
  const auth = await requireMasterAdmin(req);
  if ((auth as any)?.status) return auth; // returned a NextResponse (401/403)

  const { data, error } = await supabaseServer.from("users").select("*");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const auth = await requireMasterAdmin(req);
  if ((auth as any)?.status) return auth;

  const body = await req.json();
  const { user_id, role } = body;
  if (!user_id || !role)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("users")
    .update({ role })
    .eq("user_id", user_id)
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] ?? null);
}
