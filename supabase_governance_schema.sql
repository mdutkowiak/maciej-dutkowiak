-- Add soft-delete to sitemap
alter table sitemap add column if not exists is_deleted boolean default false;

-- Create Redirects Table
create table redirects (
  id uuid primary key default uuid_generate_v4(),
  old_path text not null unique,
  new_path text not null,
  created_at timestamptz default now()
);

-- RLS
alter table redirects enable row level security;
create policy "Public Access Redirects" on redirects for all using (true) with check (true);
