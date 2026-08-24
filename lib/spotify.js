const API = "https://api.spotify.com/v1";

export function spotifyAuthorizeUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    response_type: "code",
    scope: "user-read-currently-playing user-read-playback-state",
    state,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function basicAuthHeader() {
  const raw = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

export async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body,
  });
  if (!res.ok) throw new Error(`spotify token exchange failed: ${res.status}`);
  return res.json(); // { access_token, refresh_token, expires_in, ... }
}

export async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body,
  });
  if (!res.ok) throw new Error(`spotify token refresh failed: ${res.status}`);
  return res.json(); // { access_token, expires_in, ... } (refresh_token sometimes omitted — reuse the old one)
}

export async function fetchSpotifyProfile(accessToken) {
  const res = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`fetch spotify profile failed: ${res.status}`);
  return res.json(); // { id, display_name, images, ... }
}

// Returns null when nothing is playing (204) — that's a valid, common state.
export async function fetchNowPlaying(accessToken) {
  const res = await fetch(`${API}/me/player/currently-playing`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 204 || res.status === 404) return null;
  if (!res.ok) throw new Error(`fetch now playing failed: ${res.status}`);
  const data = await res.json();
  if (!data || !data.item) return null;
  return {
    is_playing: data.is_playing,
    progress_ms: data.progress_ms,
    duration_ms: data.item.duration_ms,
    title: data.item.name,
    artist: data.item.artists?.map((a) => a.name).join(", "),
    cover: data.item.album?.images?.[0]?.url || null,
    track_url: data.item.external_urls?.spotify || null,
  };
}
