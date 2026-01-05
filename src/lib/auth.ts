import { NextResponse } from "next/server";
import supabaseServer from "~/lib/supabaseServer";

export async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  let token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : authHeader ?? null;

  // fallback: look for common Supabase cookie
  if (!token) {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/sb-access-token=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (!token) return { user: null, profile: null };

  const { data: userData, error: userErr } = await supabaseServer.auth.getUser(
    token
  );
  if (userErr) return { user: null, profile: null };
  const user = userData?.user ?? null;
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabaseServer
    .from("users")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  return { user, profile };
}

export async function requireMasterAdmin(req: Request) {
  const { user, profile } = await getUserFromRequest(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!profile || profile.role !== "master_admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return { user, profile };
}

export async function requireAuth(req: Request) {
  const { user, profile } = await getUserFromRequest(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return { user, profile };
}
