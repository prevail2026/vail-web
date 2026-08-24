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
  updated_at timestamptz default now()
);

create unique index if not exists users_username_idx on users (lower(username));
