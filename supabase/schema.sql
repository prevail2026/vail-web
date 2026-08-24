-- run this once in Supabase's SQL editor

create table if not exists users (
  id text primary key,              -- discord user id (snowflake, as text to avoid bigint edge cases)
  username text not null,           -- discord username, used in the public url: /u/<username>
  global_name text,
  avatar text,                      -- discord avatar hash
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists profiles (
  user_id text primary key references users(id) on delete cascade,
  display_name text,
  bio text default '',
  accent_color text default '#ffffff',
  font text default 'JetBrains Mono',
  buttons jsonb default '[]',       -- [{ "label": "GitHub", "url": "https://...", "icon": "github" }, ...]
  widgets jsonb default '[]',       -- enabled widget ids, in display order, e.g. ["github", "spotify"]
  updated_at timestamptz default now()
);

create unique index if not exists users_username_idx on users (lower(username));

-- one row per (user, provider): the external account they've linked, and
-- whatever we need to fetch fresh data for that provider's widget.
create table if not exists linked_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  provider text not null,              -- 'github' | 'spotify'
  provider_user_id text not null,
  provider_username text,              -- public handle, shown on the widget
  access_token text,                   -- server-only, never sent to the browser
  refresh_token text,
  expires_at timestamptz,
  meta jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, provider)
);
