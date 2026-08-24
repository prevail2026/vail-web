import {
  exchangeCodeForToken,
  fetchDiscordUser,
  fetchGuildMember,
  hasAllowedRole,
} from "@/lib/discord";
import { signSession, sessionCookieHeader } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return Response.redirect(`${url.origin}/dashboard/login?error=${error}`, 302);
  }
  if (!code) {
    return Response.redirect(`${url.origin}/dashboard/login?error=missing_code`, 302);
  }

  try {
    const token = await exchangeCodeForToken(code);
    const discordUser = await fetchDiscordUser(token.access_token);
    const member = await fetchGuildMember(token.access_token);

    if (!hasAllowedRole(member)) {
      // Authenticated with Discord, but not authorized for the dashboard.
      return Response.redirect(`${url.origin}/dashboard/login?error=not_authorized`, 302);
    }

    // upsert the user + make sure a profile row exists
    await supabase.from("users").upsert({
      id: discordUser.id,
      username: discordUser.username,
      global_name: discordUser.global_name,
      avatar: discordUser.avatar,
      updated_at: new Date().toISOString(),
    });

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", discordUser.id)
      .maybeSingle();

    if (!existingProfile) {
      await supabase.from("profiles").insert({
        user_id: discordUser.id,
        display_name: discordUser.global_name || discordUser.username,
      });
    }

    const session = signSession({ id: discordUser.id, username: discordUser.username });
    const headers = new Headers();
    headers.append("Set-Cookie", sessionCookieHeader(session));
    headers.append("Location", `${url.origin}/dashboard`);
    return new Response(null, { status: 302, headers });
  } catch (err) {
    console.error("Discord OAuth callback failed:", err);
    return Response.redirect(`${url.origin}/dashboard/login?error=server_error`, 302);
  }
}
