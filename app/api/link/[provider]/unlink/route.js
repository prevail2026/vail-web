import { getSessionFromCookies } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { PROVIDERS } from "@/lib/providers";

export async function POST(request, { params }) {
  const { provider } = params;
  if (!PROVIDERS[provider]) {
    return Response.json({ error: "unknown_provider" }, { status: 400 });
  }

  const session = await getSessionFromCookies(request.headers.get("cookie"));
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { error: deleteError } = await supabase
    .from("linked_accounts")
    .delete()
    .eq("user_id", session.id)
    .eq("provider", provider);
  if (deleteError) {
    console.error("Failed to unlink account:", deleteError);
    return Response.json({ error: "unlink_failed" }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("widgets")
    .eq("user_id", session.id)
    .maybeSingle();

  if (profile && Array.isArray(profile.widgets) && profile.widgets.includes(provider)) {
    await supabase
      .from("profiles")
      .update({ widgets: profile.widgets.filter((w) => w !== provider) })
      .eq("user_id", session.id);
  }

  return Response.json({ ok: true });
}
