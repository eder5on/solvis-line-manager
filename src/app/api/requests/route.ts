import { NextResponse } from "next/server";
import supabaseServer from "~/lib/supabaseServer";
import {
  getUserFromRequest,
  requireAuth,
  requireMasterAdmin,
} from "~/lib/auth";

export async function GET(req: Request) {
  const { user, profile } = await getUserFromRequest(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Master admin sees all, others see only their requests
  if (profile?.role === "master_admin") {
    const { data, error } = await supabaseServer
      .from("requests")
      .select("*, lines(number)");
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabaseServer
    .from("requests")
    .select("*, lines(number)")
    .eq("created_by", user.id);
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
    notes: body.notes ?? null,
    created_by: user.id,
    status: "Pendente",
  };

  const { data, error } = await supabaseServer
    .from("requests")
    .insert([payload])
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data?.[0]);
}

export async function PATCH(req: Request) {
  // Only master admin can change status/comments in a broader way
  const auth = await requireMasterAdmin(req);
  if ((auth as any)?.status) return auth;

  const body = await req.json();
  const { id, status, notes } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("requests")
    .update({ status, notes })
    .eq("id", id)
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0]);
}
