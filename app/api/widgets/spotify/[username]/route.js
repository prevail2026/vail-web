import { supabase } from "@/lib/supabase";
import { refreshAccessToken, fetchNowPlaying } from "@/lib/spotify";

export async function GET(request, { params }) {
  const { username } = params;

  const { data: user } = await supabase.from("users").select("id").ilike("username", username).maybeSingle();
  if (!user) return Response.json({ error: "not_found" }, { status: 404 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("widgets")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile?.widgets?.includes("spotify")) {
    return Response.json({ error: "widget_disabled" }, { status: 404 });
  }

  const { data: linked } = await supabase
    .from("linked_accounts")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", user.id)
    .eq("provider", "spotify")
    .maybeSingle();
  if (!linked) return Response.json({ error: "not_linked" }, { status: 404 });

  let accessToken = linked.access_token;

  const isExpired = !linked.expires_at || new Date(linked.expires_at).getTime() < Date.now() + 30_000;
  if (isExpired && linked.refresh_token) {
    try {
      const refreshed = await refreshAccessToken(linked.refresh_token);
      accessToken = refreshed.access_token;
      await supabase
        .from("linked_accounts")
        .update({
          access_token: accessToken,
          expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("provider", "spotify");
    } catch (err) {
      console.error("spotify token refresh failed:", err);
      return Response.json({ error: "refresh_failed" }, { status: 502 });
    }
  }

  try {
    const nowPlaying = await fetchNowPlaying(accessToken);
    return Response.json(nowPlaying); // null when nothing is currently playing
  } catch (err) {
    console.error("spotify now-playing fetch failed:", err);
    return Response.json({ error: "fetch_failed" }, { status: 502 });
  }
}
