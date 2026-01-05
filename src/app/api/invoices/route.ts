import { NextResponse } from "next/server";
import supabaseServer from "~/lib/supabaseServer";
import {
  requireAuth,
  requireMasterAdmin,
  getUserFromRequest,
} from "~/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const line_id = url.searchParams.get("line_id");
  const { user, profile } = await getUserFromRequest(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (profile?.role === "master_admin" && !line_id) {
    const { data, error } = await supabaseServer.from("invoices").select("*");
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (line_id) {
    const { data, error } = await supabaseServer
      .from("invoices")
      .select("*")
      .eq("line_id", line_id)
      .order("uploaded_at", { ascending: false });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    const enriched = await Promise.all(
      (data || []).map(async (inv: any) => {
        try {
          const { data: urlData } = await supabaseServer.storage
            .from("invoices")
            .createSignedUrl(inv.file_path, 60 * 60);
          return { ...inv, signed_url: urlData?.signedURL ?? null };
        } catch (_e) {
          return { ...inv, signed_url: null };
        }
      })
    );

    return NextResponse.json(enriched);
  }

  return NextResponse.json({ error: "Missing line_id" }, { status: 400 });
}

export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if ((auth as any)?.status) return auth;
  const { user } = auth as any;

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const line_id = form.get("line_id") as string | null;
  const amount = form.get("amount") as string | null;

  if (!file || !line_id)
    return NextResponse.json(
      { error: "Missing file or line_id" },
      { status: 400 }
    );

  const filename = `${Date.now()}_${file.name}`;
  const path = `${line_id}/${filename}`;

  const { data: uploadData, error: uploadError } = await supabaseServer.storage
    .from("invoices")
    .upload(path, file as any, { upsert: false });

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data, error } = await supabaseServer
    .from("invoices")
    .insert([
      {
        line_id,
        file_path: path,
        amount: amount ? Number(amount) : null,
        uploaded_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // create a signed url to return for immediate viewing (1 hour)
  const { data: signed } = await supabaseServer.storage
    .from("invoices")
    .createSignedUrl(path, 60 * 60);

  return NextResponse.json({
    invoice: data?.[0],
    url: signed?.signedURL ?? null,
  });
}
