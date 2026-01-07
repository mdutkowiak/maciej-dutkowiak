-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Sitemap Table (Tree Structure & Metadata)
create table sitemap (
  id text primary key, -- client-side generated or uuid
  title text not null,
  slug text not null,
  parent_id text references sitemap(id) on delete cascade,
  status text default 'draft', -- 'draft' | 'published'
  locked boolean default false,
  last_modified timestamptz default now(),
  seo_metadata jsonb default '{}'::jsonb,
  template_id text
);

-- 2. Page Content Table (Heavy JSON data)
-- We separate this to keep the tree fetch lightweight
create table page_content (
  page_id text primary key references sitemap(id) on delete cascade,
  components jsonb default '[]'::jsonb,
  custom_code jsonb default '{}'::jsonb
);

-- 3. Storage Policies (If 'media' bucket exists)
-- Ensure you create a bucket named 'media' in Supabase Storage

-- RLS Policies (Simple Public Read/Write for MVP - NOT FOR PRODUCTION)
alter table sitemap enable row level security;
alter table page_content enable row level security;

-- Allow public read/write (since we don't have Auth implemented yet)
create policy "Public Access Sitemap" on sitemap for all using (true) with check (true);
create policy "Public Access Content" on page_content for all using (true) with check (true);
