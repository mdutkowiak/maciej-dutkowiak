-- user_preferences table for per-user settings
create table if not exists user_preferences (
  user_id text primary key default 'anonymous', -- Using 'anonymous' for MVP without Auth
  collapsed_nodes text[] default '{}',
  updated_at timestamptz default now()
);

-- Ensure RLS is enabled
alter table user_preferences enable row level security;

-- Allow public access for MVP
create policy "Public Access User Prefs" on user_preferences for all using (true) with check (true);

-- Insert initial row
insert into user_preferences (user_id) values ('anonymous') on conflict (user_id) do nothing;
