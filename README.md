# Discord-gated profile dashboard

## 1. Discord app
1. https://discord.com/developers/applications → New Application.
2. OAuth2 tab → add a redirect URL: `https://yourdomain.vercel.app/api/auth/callback`
   (and `http://localhost:3000/api/auth/callback` for local dev).
3. Copy the Client ID and Client Secret into `.env`.

## 2. Find your guild id and role id
1. Enable Developer Mode in Discord (User Settings → Advanced).
2. Right-click your server → Copy Server ID → `DISCORD_GUILD_ID`.
3. Right-click the role that should have dashboard access → Copy Role ID →
   `DISCORD_ALLOWED_ROLE_ID`.

Note: `guilds.members.read` only returns role data for guilds the user is
**already a member of** — there's no bot required, but the user must have
joined your server before logging in.

## 3. Supabase
1. Create a project at supabase.com.
2. SQL editor → paste and run `supabase/schema.sql`.
3. Project Settings → API → copy the URL and the `service_role` key
   (NOT the anon key — the service role key is server-only and must
   never be exposed to the browser) into `.env`.

## 4. Session secret
Generate one: `openssl rand -hex 32` → `SESSION_SECRET`.

## 5. Deploy
1. `cp .env.example .env` and fill in all values, then add the same
   variables in Vercel's project settings (Environment Variables).
2. `vercel` or connect the repo in the Vercel dashboard.

## How it works
- `/api/auth/login` redirects to Discord.
- `/api/auth/callback` exchanges the code, checks the user has
  `DISCORD_ALLOWED_ROLE_ID` in `DISCORD_GUILD_ID`, upserts a `users` +
  `profiles` row, and sets an httpOnly JWT session cookie.
- `/dashboard` (protected by `middleware.js`) lets a logged-in user edit
  their `profiles` row via `/api/dashboard/save`.
- `/u/[username]` is the public page anyone can view, rendered from that
  user's `profiles` row (accent color, font, bio, buttons).

## Extending
- Add more editable fields (background style, custom CSS, social links
  with icons) by extending the `profiles` table and the dashboard form —
  the `buttons` column is already JSON so it's flexible for icon/order/etc.
- To reuse your existing static site's exact look (Discord presence card,
  music tabs, contribution graph) on `/u/[username]`, port that HTML/CSS
  into a React component and drive the color/font from `profile.accent_color`
  / `profile.font` via CSS variables, same pattern as your current `--bg`,
  `--accent`, etc.
