import { supabase } from "@/lib/supabase";
import { fetchPublicGithubStats } from "@/lib/github";

export async function GET(request, { params }) {
  const { username } = params;

  const { data: user } = await supabase.from("users").select("id").ilike("username", username).maybeSingle();
  if (!user) return Response.json({ error: "not_found" }, { status: 404 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("widgets")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile?.widgets?.includes("github")) {
    return Response.json({ error: "widget_disabled" }, { status: 404 });
  }

  const { data: linked } = await supabase
    .from("linked_accounts")
    .select("provider_username")
    .eq("user_id", user.id)
    .eq("provider", "github")
    .maybeSingle();
  if (!linked) return Response.json({ error: "not_linked" }, { status: 404 });

  const stats = await fetchPublicGithubStats(linked.provider_username);
  if (!stats) return Response.json({ error: "fetch_failed" }, { status: 502 });

  return Response.json(stats);
}
