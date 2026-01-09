-- Media Folders Table
create table media_folders (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  parent_id uuid references media_folders(id) on delete cascade,
  created_at timestamptz default now()
);

-- Assets Table
create table assets (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  file_url text not null,
  file_type text,
  size_bytes bigint,
  folder_id uuid references media_folders(id) on delete set null,
  is_deleted boolean default false,
  created_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

-- RLS
alter table media_folders enable row level security;
alter table assets enable row level security;

create policy "Public Access Media Folders" on media_folders for all using (true) with check (true);
create policy "Public Access Assets" on assets for all using (true) with check (true);
