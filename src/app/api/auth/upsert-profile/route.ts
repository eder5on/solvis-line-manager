import { NextResponse } from "next/server";
import supabaseServer from "~/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = body.user;
    if (!user?.id)
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });

    const payload = {
      user_id: user.id,
      email: user.email ?? null,
      full_name: user.full_name ?? null,
    };

    const { data, error } = await supabaseServer
      .from("users")
      .upsert(payload, { onConflict: ["user_id"] })
      .select()
      .limit(1);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: data?.[0] ?? null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
