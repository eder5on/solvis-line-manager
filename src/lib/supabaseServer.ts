import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// Prefer a service role key for server operations. For local dev, we fall back to the ANON key
// to avoid crashing, but this is less secure and not recommended for production.
const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;

if (!url || !serviceRole) {
  throw new Error(
    "Missing SUPABASE env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

if (
  !process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  // eslint-disable-next-line no-console
  console.warn(
    "Using NEXT_PUBLIC_SUPABASE_ANON_KEY as server key (insecure). Set SUPABASE_SERVICE_ROLE_KEY in .env.local for server operations."
  );
}

export const supabaseServer = createClient(url, serviceRole, {
  auth: { persistSession: false },
});

export default supabaseServer;
