-- Fix Media Upload Failure
-- Run this in Supabase SQL Editor to initialize the Storage Bucket and Policies.

-- 1. Create 'media' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- 2. Drop potentially conflicting policies
drop policy if exists "Public Access Media" on storage.objects;
drop policy if exists "Public Insert Media" on storage.objects;
drop policy if exists "Public Update Media" on storage.objects;
drop policy if exists "Public Delete Media" on storage.objects;

-- 3. Create Public Policies (Allows anyone to View, Upload, Update, Delete in 'media' bucket)
-- Note: In a production app with Auth, you should restrict Insert/Update/Delete to authenticated users.

-- Allow public read access
create policy "Public Access Media"
on storage.objects for select
using ( bucket_id = 'media' );

-- Allow public upload
create policy "Public Insert Media"
on storage.objects for insert
with check ( bucket_id = 'media' );

-- Allow public update
create policy "Public Update Media"
on storage.objects for update
using ( bucket_id = 'media' );

-- Allow public delete
create policy "Public Delete Media"
on storage.objects for delete
using ( bucket_id = 'media' );
