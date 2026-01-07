-- site_settings table for global configurations
create table if not exists site_settings (
  id text primary key default 'global',
  header jsonb default '{"logoUrl": "", "showSearch": true, "menuItems": [], "bgColor": "#ffffff", "textColor": "#000000", "accentColor": "#2563eb"}'::jsonb,
  footer jsonb default '{"sections": [], "copyright": "© 2024 LaQ CMS - All rights reserved", "socialLinks": [], "bgColor": "#111827", "textColor": "#ffffff"}'::jsonb,
  theme jsonb default '{"primaryColor": "#2563eb", "borderRadius": "0.5rem"}'::jsonb,
  updated_at timestamptz default now()
);

-- Insert initial settings if they don't exist
insert into site_settings (id) 
values ('global') 
on conflict (id) do nothing;

-- Ensure RLS is enabled
alter table site_settings enable row level security;

-- Allow public read/write for MVP
create policy "Public Access Site Settings" on site_settings for all using (true) with check (true);
