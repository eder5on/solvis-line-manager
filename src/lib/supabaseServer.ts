import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!url || !serviceRole) {
  throw new Error("Missing SUPABASE service env vars for server client");
}

export const supabaseServer = createClient(url, serviceRole, {
  auth: { persistSession: false },
});

export default supabaseServer;
