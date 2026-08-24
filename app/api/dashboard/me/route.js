import { getSessionFromCookies } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  const session = await getSessionFromCookies(request.headers.get("cookie"));
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { data: user } = await supabase.from("users").select("*").eq("id", session.id).maybeSingle();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session.id)
    .maybeSingle();
  // never select access_token / refresh_token here — this response goes to the browser
  const { data: linkedAccounts } = await supabase
    .from("linked_accounts")
    .select("provider, provider_username, meta, created_at")
    .eq("user_id", session.id);

  return Response.json({ user, profile, linkedAccounts: linkedAccounts || [] });
}
