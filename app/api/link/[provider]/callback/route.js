import {
  getSessionFromCookies,
  getOauthStateFromCookies,
  clearOauthStateCookieHeader,
} from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { PROVIDERS } from "@/lib/providers";
import * as github from "@/lib/github";
import * as spotify from "@/lib/spotify";

async function handleGithub(code) {
  const token = await github.exchangeCodeForToken(code);
  const user = await github.fetchGithubUser(token.access_token);
  return {
    provider_user_id: String(user.id),
    provider_username: user.login,
    access_token: token.access_token,
    refresh_token: null,
    expires_at: null,
    meta: { name: user.name, avatar_url: user.avatar_url, html_url: user.html_url },
  };
}

async function handleSpotify(code) {
  const token = await spotify.exchangeCodeForToken(code);
  const profile = await spotify.fetchSpotifyProfile(token.access_token);
  return {
    provider_user_id: profile.id,
    provider_username: profile.display_name || profile.id,
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
    meta: { image: profile.images?.[0]?.url || null },
  };
}

const HANDLERS = { github: handleGithub, spotify: handleSpotify };

export async function GET(request, { params }) {
  const { provider } = params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const clearState = new Headers();
  clearState.append("Set-Cookie", clearOauthStateCookieHeader());

  function redirectWithClearedState(path) {
    clearState.append("Location", `${url.origin}${path}`);
    return new Response(null, { status: 302, headers: clearState });
  }

  if (!PROVIDERS[provider] || !HANDLERS[provider]) {
    return redirectWithClearedState("/dashboard?linkError=unknown_provider");
  }
  if (error) {
    return redirectWithClearedState(`/dashboard?linkError=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return redirectWithClearedState("/dashboard?linkError=missing_code");
  }

  const session = await getSessionFromCookies(request.headers.get("cookie"));
  if (!session) {
    return redirectWithClearedState("/dashboard/login");
  }

  const expectedState = getOauthStateFromCookies(request.headers.get("cookie"));
  if (!expectedState || expectedState !== state) {
    return redirectWithClearedState("/dashboard?linkError=bad_state");
  }

  try {
    const linked = await HANDLERS[provider](code);

    const { error: dbError } = await supabase.from("linked_accounts").upsert(
      {
        user_id: session.id,
        provider,
        ...linked,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" }
    );
    if (dbError) throw dbError;

    return redirectWithClearedState(`/dashboard?linked=${provider}`);
  } catch (err) {
    console.error(`${provider} link callback failed:`, err);
    return redirectWithClearedState("/dashboard?linkError=server_error");
  }
}
