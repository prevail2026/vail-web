import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key — never expose this key
// or this client to the browser. All DB access happens inside API routes.
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
