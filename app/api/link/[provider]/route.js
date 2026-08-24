import { randomBytes } from "crypto";
import { getSessionFromCookies, oauthStateCookieHeader } from "@/lib/session";
import { PROVIDERS } from "@/lib/providers";
import { githubAuthorizeUrl } from "@/lib/github";
import { spotifyAuthorizeUrl } from "@/lib/spotify";

const AUTHORIZE_URL_BUILDERS = {
  github: githubAuthorizeUrl,
  spotify: spotifyAuthorizeUrl,
};

export async function GET(request, { params }) {
  const { provider } = params;
  const url = new URL(request.url);

  if (!PROVIDERS[provider]) {
    return Response.redirect(`${url.origin}/dashboard?linkError=unknown_provider`, 302);
  }

  const session = await getSessionFromCookies(request.headers.get("cookie"));
  if (!session) {
    return Response.redirect(`${url.origin}/dashboard/login`, 302);
  }

  const state = randomBytes(16).toString("hex");
  const authorizeUrl = AUTHORIZE_URL_BUILDERS[provider](state);

  const headers = new Headers();
  headers.append("Set-Cookie", oauthStateCookieHeader(state));
  headers.append("Location", authorizeUrl);
  return new Response(null, { status: 302, headers });
}
