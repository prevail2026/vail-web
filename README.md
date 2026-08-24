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

## 4b. Linked accounts (optional widgets)

Each provider below is optional — the "Linked accounts" section in the
dashboard just won't offer a button to connect it until its env vars exist.

**GitHub** (stats widget: followers, following, public repos)
1. https://github.com/settings/developers → New OAuth App.
2. Homepage URL: `https://yourdomain.vercel.app`. Authorization callback URL:
   `https://yourdomain.vercel.app/api/link/github/callback`
   (and `http://localhost:3000/api/link/github/callback` for local dev).
3. Copy the Client ID, and generate + copy a Client Secret, into `.env` as
   `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`. Set `GITHUB_REDIRECT_URI` to
   the callback URL above.

**Spotify** (now-playing widget, updates live while viewing a profile)
1. https://developer.spotify.com/dashboard → Create app.
2. Redirect URI: `https://yourdomain.vercel.app/api/link/spotify/callback`
   (and the `localhost:3000` equivalent for local dev). Enable the
   "Web API" API.
3. Copy the Client ID and Client Secret into `.env` as
   `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`, and set
   `SPOTIFY_REDIRECT_URI` to the callback URL above.

Note: while a Spotify app is in Development Mode, only accounts you
explicitly add under Dashboard → your app → User Management can complete
the login — fine for testing with your own account, but you'll need Spotify
to review the app (Quota Extension request) before other users can link
theirs.

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
  their `profiles` row via `/api/dashboard/save`, connect/disconnect
  provider accounts, and toggle which widgets show on their page.
- `/u/[username]` is the public page anyone can view, rendered from that
  user's `profiles` row (accent color, font, bio, buttons) plus any
  enabled widgets.

## Linked accounts & widgets
- `linked_accounts` (one row per user+provider) stores the OAuth tokens
  needed to fetch that provider's data — `access_token`/`refresh_token`
  never leave the server; `/api/dashboard/me` only ever returns
  `provider_username` and `meta` to the browser.
- `profiles.widgets` is the list of provider ids the user has switched on
  (e.g. `["github", "spotify"]`). `/api/dashboard/save` cross-checks this
  against `linked_accounts` server-side, so a widget can't be turned on
  without a real linked account behind it.
- `/api/link/[provider]` starts the OAuth handshake (CSRF-protected via a
  short-lived `state` cookie); `/api/link/[provider]/callback` stores the
  tokens; `/api/link/[provider]/unlink` removes them and turns the widget
  off automatically.
- `/api/widgets/github/[username]` and `/api/widgets/spotify/[username]`
  serve the public, per-widget data the profile page polls — they 404 if
  that user hasn't enabled the widget, so nothing is exposed that the user
  didn't opt into showing.

## Extending
- Add more editable fields (background style, custom CSS, social links
  with icons) by extending the `profiles` table and the dashboard form —
  the `buttons` column is already JSON so it's flexible for icon/order/etc.
- To add another linkable provider (Valorant, Twitch, Steam, ...): add an
  entry to `lib/providers.js`, a `lib/<provider>.js` with the same shape as
  `lib/github.js`, a case in the two `[provider]` API routes, a widget
  component in `app/u/[username]/widgets.js`, and a matching
  `app/api/widgets/<provider>/[username]/route.js`.
