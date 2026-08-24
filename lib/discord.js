const API = "https://discord.com/api/v10";

export function discordAuthorizeUrl() {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: "code",
    // identify: basic profile. guilds.members.read: lets us check roles
    // in DISCORD_GUILD_ID without running a bot.
    scope: "identify guilds.members.read",
    prompt: "consent",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
  });

  const res = await fetch(`${API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status}`);
  return res.json(); // { access_token, token_type, expires_in, refresh_token, scope }
}

export async function fetchDiscordUser(accessToken) {
  const res = await fetch(`${API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`fetch user failed: ${res.status}`);
  return res.json(); // { id, username, global_name, avatar, ... }
}

// Requires the guilds.members.read scope AND the user to already be a
// member of DISCORD_GUILD_ID. Returns null if they aren't a member.
export async function fetchGuildMember(accessToken) {
  const guildId = process.env.DISCORD_GUILD_ID;
  const res = await fetch(`${API}/users/@me/guilds/${guildId}/member`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 404) return null; // not a member of the guild
  if (!res.ok) throw new Error(`fetch guild member failed: ${res.status}`);
  return res.json(); // { roles: [...], nick, ... }
}

export function hasAllowedRole(member) {
  if (!member) return false;
  const allowedRole = process.env.DISCORD_ALLOWED_ROLE_ID;
  return Array.isArray(member.roles) && member.roles.includes(allowedRole);
}
