-- ============================================================
-- Migration 004: Children, Albums, Tags
-- ============================================================

-- ─── Children (expanded) ─────────────────────────────────
-- Drop old simple version and replace with richer schema
alter table public.children
  add column if not exists avatar_color  text default '#E8640A',  -- UI color for this child
  add column if not exists avatar_emoji  text default '🎨',       -- Emoji avatar
  add column if not exists date_of_birth date,
  add column if not exists school_name   text,
  add column if not exists is_archived   boolean default false;

-- ─── Tags ────────────────────────────────────────────────
-- Global tag pool per user — reusable across all children
create table public.tags (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,                    -- e.g. "1st Grade", "Christmas"
  slug        text not null,                    -- e.g. "1st-grade", "christmas"
  color       text not null default '#E8640A',  -- Hex color for the tag pill
  icon        text,                             -- Optional emoji
  created_at  timestamptz default now() not null,
  unique (user_id, slug)
);

-- Seed some default tags (inserted per-user on first login via app logic)
-- Examples: '1st Grade', '2nd Grade', 'K', 'Christmas', 'Halloween',
--           'Valentine', 'Spring', 'Summer', 'Self Portrait', 'Favorite'

-- ─── Artwork ↔ Tags (many-to-many) ───────────────────────
create table public.artwork_tags (
  artwork_id  uuid references public.artworks(id) on delete cascade not null,
  tag_id      uuid references public.tags(id)     on delete cascade not null,
  primary key (artwork_id, tag_id)
);

-- ─── Albums ──────────────────────────────────────────────
create table public.albums (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users(id)      on delete cascade not null,
  child_id        uuid references public.children(id) on delete cascade,  -- null = all children
  name            text not null,
  description     text,
  cover_artwork_id uuid references public.artworks(id) on delete set null,
  color           text default '#E8640A',
  icon            text default '📁',
  sort_order      int  default 0,
  is_smart        boolean default false,        -- Smart album: auto-populated by rules
  smart_rules     jsonb,                        -- { tags: ['christmas'], grade: '1st', dateRange: [...] }
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

-- ─── Artwork ↔ Albums (many-to-many) ─────────────────────
create table public.album_artworks (
  album_id    uuid references public.albums(id)   on delete cascade not null,
  artwork_id  uuid references public.artworks(id) on delete cascade not null,
  added_at    timestamptz default now() not null,
  sort_order  int default 0,
  primary key (album_id, artwork_id)
);

-- ─── Update artworks table ────────────────────────────────
-- grade and school_year already exist; add a few more useful fields
alter table public.artworks
  add column if not exists medium       text,    -- "crayon", "watercolor", "marker", etc.
  add column if not exists display_order int default 0;

-- ─── RLS for new tables ───────────────────────────────────
alter table public.tags           enable row level security;
alter table public.artwork_tags   enable row level security;
alter table public.albums         enable row level security;
alter table public.album_artworks enable row level security;

create policy "Users manage own tags"
  on public.tags for all using (auth.uid() = user_id);

create policy "Users manage own artwork_tags"
  on public.artwork_tags for all
  using (exists (
    select 1 from public.artworks a
    where a.id = artwork_tags.artwork_id and a.user_id = auth.uid()
  ));

create policy "Users manage own albums"
  on public.albums for all using (auth.uid() = user_id);

create policy "Users manage own album_artworks"
  on public.album_artworks for all
  using (exists (
    select 1 from public.albums al
    where al.id = album_artworks.album_id and al.user_id = auth.uid()
  ));

-- ─── Indexes ─────────────────────────────────────────────
create index tags_user_id_idx          on public.tags(user_id);
create index artwork_tags_artwork_idx  on public.artwork_tags(artwork_id);
create index artwork_tags_tag_idx      on public.artwork_tags(tag_id);
create index albums_user_id_idx        on public.albums(user_id);
create index albums_child_id_idx       on public.albums(child_id);
create index album_artworks_album_idx  on public.album_artworks(album_id);

-- ─── Triggers ────────────────────────────────────────────
create trigger albums_updated_at before update on public.albums
  for each row execute procedure public.update_updated_at();

-- ─── Helper view: artworks with tags ─────────────────────
create or replace view public.artworks_with_tags as
select
  a.*,
  c.name          as child_name,
  c.avatar_color  as child_color,
  c.avatar_emoji  as child_emoji,
  coalesce(
    json_agg(
      json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'color', t.color, 'icon', t.icon)
      order by t.name
    ) filter (where t.id is not null),
    '[]'
  ) as tags_json
from public.artworks a
left join public.children c on c.id = a.child_id
left join public.artwork_tags at2 on at2.artwork_id = a.id
left join public.tags t on t.id = at2.tag_id
group by a.id, c.name, c.avatar_color, c.avatar_emoji;
