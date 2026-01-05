import { NextResponse } from "next/server";
import supabaseServer from "~/lib/supabaseServer";
import { requireMasterAdmin } from "~/lib/auth";

export async function POST(req: Request) {
  const auth = await requireMasterAdmin(req);
  if ((auth as any)?.error) return auth as any;

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.changes))
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const changes: any[] = body.changes;

  // create import run
  const { data: runData } = await supabaseServer
    .from("import_runs")
    .insert([{ filename: body.filename || null, uploaded_by: auth.user.id }])
    .select()
    .limit(1)
    .maybeSingle();
  const runId = runData?.id;
  const results: any[] = [];

  for (const c of changes) {
    const type = c.type;
    const number = c.number;
    const justification = c.justification || null;
    if (type === "add") {
      // ensure client/unit
      let clientId = null;
      if (c.data.client_name) {
        const { data: existingClient } = await supabaseServer
          .from("clients")
          .select("id")
          .ilike("name", c.data.client_name)
          .limit(1);
        clientId = existingClient && existingClient[0] && existingClient[0].id;
        if (!clientId) {
          const { data: inserted } = await supabaseServer
            .from("clients")
            .insert([{ name: c.data.client_name }])
            .select()
            .limit(1)
            .maybeSingle();
          clientId = inserted?.id;
        }
      }
      let unitId = null;
      if (c.data.unit_name && clientId) {
        const { data: insertedU } = await supabaseServer
          .from("units")
          .insert([{ client_id: clientId, name: c.data.unit_name }])
          .select()
          .limit(1)
          .maybeSingle();
        unitId = insertedU?.id;
      }

      const { data: insertedLine } = await supabaseServer
        .from("lines")
        .insert([
          {
            number,
            operator_real: c.data.operator_real || c.data.operator || "",
            operator_current:
              c.data.operator_current ||
              c.data.operator_current ||
              c.data.operator ||
              "",
            client_id: clientId,
            unit_id: unitId,
            monthly_cost: c.data.monthly_cost || null,
            status: c.data.status || "Ativa",
          },
        ])
        .select()
        .limit(1)
        .maybeSingle();

      await supabaseServer
        .from("line_import_changes")
        .insert([
          {
            import_run: runId,
            line_number: number,
            change_type: "added",
            old_data: null,
            new_data: c.data,
            justification,
            created_by: auth.user.id,
          },
        ]);

      results.push({ number, status: "added", id: insertedLine?.id ?? null });
    } else if (type === "update") {
      const { data: existing } = await supabaseServer
        .from("lines")
        .select("*")
        .eq("number", number)
        .limit(1)
        .maybeSingle();
      if (!existing) {
        results.push({ number, status: "not_found" });
        continue;
      }
      const oldData = existing;
      const updates: any = {};
      if (c.data.operator_real !== undefined)
        updates.operator_real = c.data.operator_real;
      if (c.data.operator_current !== undefined)
        updates.operator_current = c.data.operator_current;
      if (c.data.monthly_cost !== undefined)
        updates.monthly_cost = c.data.monthly_cost;
      if (c.data.status !== undefined) updates.status = c.data.status;
      // handle client/unit resolution if provided
      if (c.data.client_name) {
        const { data: existingClient } = await supabaseServer
          .from("clients")
          .select("id")
          .ilike("name", c.data.client_name)
          .limit(1);
        let clientId =
          existingClient && existingClient[0] && existingClient[0].id;
        if (!clientId) {
          const { data: inserted } = await supabaseServer
            .from("clients")
            .insert([{ name: c.data.client_name }])
            .select()
            .limit(1)
            .maybeSingle();
          clientId = inserted?.id;
        }
        updates.client_id = clientId;
      }
      if (c.data.unit_name && updates.client_id) {
        const { data: insertedU } = await supabaseServer
          .from("units")
          .insert([{ client_id: updates.client_id, name: c.data.unit_name }])
          .select()
          .limit(1)
          .maybeSingle();
        updates.unit_id = insertedU?.id;
      }

      const { error } = await supabaseServer
        .from("lines")
        .update(updates)
        .eq("id", existing.id);
      await supabaseServer
        .from("line_import_changes")
        .insert([
          {
            import_run: runId,
            line_number: number,
            change_type: "updated",
            old_data: oldData,
            new_data: c.data,
            justification,
            created_by: auth.user.id,
          },
        ]);

      results.push({ number, status: "updated" });
    } else if (type === "mark_removed" || type === "remove") {
      const { data: existing } = await supabaseServer
        .from("lines")
        .select("*")
        .eq("number", number)
        .limit(1)
        .maybeSingle();
      if (!existing) {
        results.push({ number, status: "not_found" });
        continue;
      }
      await supabaseServer
        .from("lines")
        .update({ status: "Removida" })
        .eq("id", existing.id);
      await supabaseServer
        .from("line_movements")
        .insert([
          {
            line_id: existing.id,
            type: "removed_by_import",
            notes: justification,
            user_id: auth.user.id,
          },
        ]);
      await supabaseServer
        .from("line_import_changes")
        .insert([
          {
            import_run: runId,
            line_number: number,
            change_type: "removed",
            old_data: existing,
            new_data: null,
            justification,
            created_by: auth.user.id,
          },
        ]);
      results.push({ number, status: "removed" });
    } else {
      results.push({ number, status: "skipped" });
    }
  }

  return NextResponse.json({ ok: true, results });
}
