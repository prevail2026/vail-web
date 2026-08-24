const API = "https://api.github.com";

export function githubAuthorizeUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope: "read:user",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
    }),
  });
  if (!res.ok) throw new Error(`github token exchange failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`github token exchange failed: ${data.error}`);
  return data; // { access_token, token_type, scope }
}

export async function fetchGithubUser(accessToken) {
  const res = await fetch(`${API}/user`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`fetch github user failed: ${res.status}`);
  return res.json(); // { id, login, name, followers, following, public_repos, avatar_url, html_url, ... }
}

// Public stats, no token needed — used to refresh the widget on every
// profile view without spending the linked user's rate limit context.
export async function fetchPublicGithubStats(login) {
  const res = await fetch(`${API}/users/${encodeURIComponent(login)}`, {
    headers: { Accept: "application/vnd.github+json" },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    login: data.login,
    name: data.name,
    avatar_url: data.avatar_url,
    html_url: data.html_url,
    followers: data.followers,
    following: data.following,
    public_repos: data.public_repos,
  };
}
