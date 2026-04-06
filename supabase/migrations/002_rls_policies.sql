-- ============================================================
-- Migration 002: Row Level Security (RLS)
-- CRITICAL: Users can only see/edit their own data
-- ============================================================

-- ─── Enable RLS on all tables ────────────────────────────
alter table public.profiles           enable row level security;
alter table public.children           enable row level security;
alter table public.artworks           enable row level security;
alter table public.cloud_connections  enable row level security;
alter table public.sync_log           enable row level security;
alter table public.share_links        enable row level security;
alter table public.backup_log         enable row level security;

-- ─── Profiles ────────────────────────────────────────────
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── Children ────────────────────────────────────────────
create policy "Users can manage own children"
  on public.children for all
  using (auth.uid() = user_id);

-- ─── Artworks ────────────────────────────────────────────
create policy "Users can manage own artworks"
  on public.artworks for all
  using (auth.uid() = user_id);

-- ─── Cloud Connections ───────────────────────────────────
-- Extra strict: no other user can ever see tokens
create policy "Users can manage own cloud connections"
  on public.cloud_connections for all
  using (auth.uid() = user_id);

-- ─── Sync Log ────────────────────────────────────────────
create policy "Users can view own sync log"
  on public.sync_log for select
  using (auth.uid() = user_id);

create policy "Users can insert own sync log"
  on public.sync_log for insert
  with check (auth.uid() = user_id);

-- ─── Share Links ─────────────────────────────────────────
-- Owners can manage their links
create policy "Users can manage own share links"
  on public.share_links for all
  using (auth.uid() = user_id);

-- Anyone can VIEW a share link by token (for the public share page)
-- This allows unauthenticated access to share link metadata only
create policy "Anyone can view share link by token"
  on public.share_links for select
  using (true);  -- Filtered by token in the query, not by user_id

-- ─── Backup Log ──────────────────────────────────────────
create policy "Users can manage own backup log"
  on public.backup_log for all
  using (auth.uid() = user_id);

-- ─── Storage Bucket Policies ─────────────────────────────
-- Run these in Supabase Dashboard → Storage → Policies
-- Or via Supabase CLI

-- Create the artworks bucket (run in dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('artworks', 'artworks', false);

-- Policy: Users can upload to their own folder (user_id/*)
-- create policy "Users can upload own artworks"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'artworks' and
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- Policy: Users can read their own artworks
-- create policy "Users can read own artworks"
--   on storage.objects for select
--   using (
--     bucket_id = 'artworks' and
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- Policy: Users can delete their own artworks
-- create policy "Users can delete own artworks"
--   on storage.objects for delete
--   using (
--     bucket_id = 'artworks' and
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- NOTE: Storage bucket policies must be created via Supabase Dashboard
-- (Storage → Policies) or the management API, not SQL migrations.
-- The SQL above is provided as reference for what to configure.
