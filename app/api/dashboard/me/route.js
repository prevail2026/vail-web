import { getSessionFromCookies } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  const session = getSessionFromCookies(request.headers.get("cookie"));
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { data: user } = await supabase.from("users").select("*").eq("id", session.id).maybeSingle();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session.id)
    .maybeSingle();

  return Response.json({ user, profile });
}
