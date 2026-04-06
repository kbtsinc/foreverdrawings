-- ============================================================
-- Migration 001: Core Schema
-- Run this in Supabase SQL Editor or via supabase db push
-- ============================================================

-- ─── Enable UUID extension ───────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific fields
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Children ────────────────────────────────────────────
-- Each user can track multiple children
create table public.children (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  birth_year  int,
  created_at  timestamptz default now() not null
);

-- ─── Artworks ────────────────────────────────────────────
create table public.artworks (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  child_id        uuid references public.children(id) on delete set null,
  title           text not null default 'Untitled',
  description     text,
  grade           text,                         -- "Kindergarten", "1st Grade", etc.
  school_year     text,                         -- "2025-2026"
  artwork_date    date default current_date,
  storage_path    text not null,                -- Supabase Storage path
  thumbnail_path  text,                         -- Auto-generated smaller version
  file_size       bigint,                       -- bytes
  mime_type       text default 'image/jpeg',
  width           int,
  height          int,
  tags            text[] default '{}',
  is_favorite     boolean default false,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

-- ─── Cloud Sync Connections ──────────────────────────────
-- Stores per-user OAuth tokens for each cloud provider
create table public.cloud_connections (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  provider        text not null check (provider in ('google_drive', 'onedrive', 'dropbox')),
  access_token    text not null,                -- Encrypted at rest by Supabase
  refresh_token   text,
  token_expires_at timestamptz,
  folder_id       text,                         -- Root folder ID in their cloud
  folder_name     text default 'Little Masterpiece',
  is_active       boolean default true,
  last_synced_at  timestamptz,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,
  unique (user_id, provider)
);

-- ─── Sync Log ────────────────────────────────────────────
-- Tracks which artworks have been synced to which providers
create table public.sync_log (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  artwork_id      uuid references public.artworks(id) on delete cascade not null,
  provider        text not null,
  cloud_file_id   text,                         -- ID of file in their cloud storage
  cloud_file_url  text,
  synced_at       timestamptz default now() not null,
  status          text default 'success' check (status in ('success', 'failed', 'pending')),
  error_message   text,
  unique (artwork_id, provider)
);

-- ─── Share Links ─────────────────────────────────────────
-- Generated when user shares a selection of artworks
create table public.share_links (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  token           text unique not null default encode(gen_random_bytes(24), 'base64url'),
  artwork_ids     uuid[] not null,              -- Max 5 artwork IDs
  title           text,
  message         text,
  expires_at      timestamptz default (now() + interval '30 days'),
  view_count      int default 0,
  created_at      timestamptz default now() not null
);

-- ─── Backup Log ──────────────────────────────────────────
create table public.backup_log (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  backup_type     text not null check (backup_type in ('manual', 'automatic')),
  status          text default 'pending' check (status in ('pending', 'running', 'success', 'failed')),
  artwork_count   int,
  total_bytes     bigint,
  destination     text,                         -- 'supabase_pitr', 'google_drive', 's3', etc.
  started_at      timestamptz default now() not null,
  completed_at    timestamptz,
  error_message   text
);

-- ─── Indexes ─────────────────────────────────────────────
create index artworks_user_id_idx       on public.artworks(user_id);
create index artworks_child_id_idx      on public.artworks(child_id);
create index artworks_artwork_date_idx  on public.artworks(artwork_date desc);
create index artworks_tags_idx          on public.artworks using gin(tags);
create index sync_log_artwork_id_idx    on public.sync_log(artwork_id);
create index share_links_token_idx      on public.share_links(token);

-- ─── Updated At Trigger ──────────────────────────────────
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger artworks_updated_at before update on public.artworks
  for each row execute procedure public.update_updated_at();

create trigger cloud_connections_updated_at before update on public.cloud_connections
  for each row execute procedure public.update_updated_at();

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();
