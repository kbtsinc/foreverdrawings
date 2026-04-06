// src/lib/childrenAlbumsTags.js
// All data operations for children, albums, and tags

import { supabase } from './supabase.js';

// ─── Default tags seeded for every new user ───────────────────────────────────
export const DEFAULT_TAGS = [
  { name: 'Kindergarten', slug: 'kindergarten', color: '#7C3AED', icon: '⭐' },
  { name: '1st Grade',    slug: '1st-grade',    color: '#2563EB', icon: '📚' },
  { name: '2nd Grade',    slug: '2nd-grade',    color: '#0891B2', icon: '📚' },
  { name: '3rd Grade',    slug: '3rd-grade',    color: '#059669', icon: '📚' },
  { name: '4th Grade',    slug: '4th-grade',    color: '#D97706', icon: '📚' },
  { name: '5th Grade',    slug: '5th-grade',    color: '#DC2626', icon: '📚' },
  { name: 'Christmas',    slug: 'christmas',    color: '#16A34A', icon: '🎄' },
  { name: 'Halloween',    slug: 'halloween',    color: '#EA580C', icon: '🎃' },
  { name: 'Valentine',    slug: 'valentine',    color: '#DB2777', icon: '❤️' },
  { name: 'Spring',       slug: 'spring',       color: '#65A30D', icon: '🌸' },
  { name: 'Summer',       slug: 'summer',       color: '#CA8A04', icon: '☀️' },
  { name: 'Thanksgiving', slug: 'thanksgiving', color: '#B45309', icon: '🦃' },
  { name: 'Self Portrait',slug: 'self-portrait',color: '#7C3AED', icon: '🪞' },
  { name: 'Favorite',     slug: 'favorite',     color: '#E8640A', icon: '⭐' },
  { name: 'Watercolor',   slug: 'watercolor',   color: '#0284C7', icon: '🎨' },
  { name: 'Crayon',       slug: 'crayon',       color: '#D97706', icon: '🖍️' },
];

// ─── Children ─────────────────────────────────────────────────────────────────

export async function fetchChildren(userId) {
  const { data, error } = await supabase
    .from('children')
    .select(`
      *,
      artworks(count)
    `)
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('name');
  if (error) throw error;
  return data;
}

export async function createChild(userId, { name, avatarColor, avatarEmoji, dateOfBirth, schoolName }) {
  const { data, error } = await supabase
    .from('children')
    .insert({
      user_id:       userId,
      name,
      avatar_color:  avatarColor  || pickRandomColor(),
      avatar_emoji:  avatarEmoji  || '🎨',
      date_of_birth: dateOfBirth  || null,
      school_name:   schoolName   || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateChild(childId, updates) {
  const { data, error } = await supabase
    .from('children')
    .update({
      name:          updates.name,
      avatar_color:  updates.avatarColor,
      avatar_emoji:  updates.avatarEmoji,
      date_of_birth: updates.dateOfBirth,
      school_name:   updates.schoolName,
    })
    .eq('id', childId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function archiveChild(childId) {
  const { error } = await supabase
    .from('children')
    .update({ is_archived: true })
    .eq('id', childId);
  if (error) throw error;
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function fetchTags(userId) {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  if (error) throw error;
  return data;
}

export async function seedDefaultTags(userId) {
  // Check if user already has tags
  const { count } = await supabase
    .from('tags')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (count > 0) return; // Already seeded

  const rows = DEFAULT_TAGS.map(t => ({ ...t, user_id: userId }));
  const { error } = await supabase.from('tags').insert(rows);
  if (error) throw error;
}

export async function createTag(userId, { name, color, icon }) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const { data, error } = await supabase
    .from('tags')
    .insert({ user_id: userId, name, slug, color: color || pickRandomColor(), icon: icon || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTag(tagId, { name, color, icon }) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const { data, error } = await supabase
    .from('tags')
    .update({ name, slug, color, icon })
    .eq('id', tagId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTag(tagId) {
  // artwork_tags cascade deletes automatically
  const { error } = await supabase.from('tags').delete().eq('id', tagId);
  if (error) throw error;
}

// ─── Artwork Tags ─────────────────────────────────────────────────────────────

export async function setArtworkTags(artworkId, tagIds) {
  // Replace all tags for this artwork
  await supabase.from('artwork_tags').delete().eq('artwork_id', artworkId);

  if (tagIds.length === 0) return;

  const rows = tagIds.map(tag_id => ({ artwork_id: artworkId, tag_id }));
  const { error } = await supabase.from('artwork_tags').insert(rows);
  if (error) throw error;
}

export async function addTagToArtwork(artworkId, tagId) {
  const { error } = await supabase
    .from('artwork_tags')
    .upsert({ artwork_id: artworkId, tag_id: tagId });
  if (error) throw error;
}

export async function removeTagFromArtwork(artworkId, tagId) {
  const { error } = await supabase
    .from('artwork_tags')
    .delete()
    .eq('artwork_id', artworkId)
    .eq('tag_id', tagId);
  if (error) throw error;
}

// ─── Albums ───────────────────────────────────────────────────────────────────

export async function fetchAlbums(userId, childId = null) {
  let query = supabase
    .from('albums')
    .select(`
      *,
      album_artworks(count),
      cover:cover_artwork_id(storage_path, title)
    `)
    .eq('user_id', userId)
    .order('sort_order')
    .order('name');

  if (childId) query = query.eq('child_id', childId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createAlbum(userId, { childId, name, description, color, icon, isSmart, smartRules }) {
  const { data, error } = await supabase
    .from('albums')
    .insert({
      user_id:     userId,
      child_id:    childId || null,
      name,
      description: description || null,
      color:       color || pickRandomColor(),
      icon:        icon  || '📁',
      is_smart:    isSmart    || false,
      smart_rules: smartRules || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAlbum(albumId, updates) {
  const { data, error } = await supabase
    .from('albums')
    .update({
      name:              updates.name,
      description:       updates.description,
      color:             updates.color,
      icon:              updates.icon,
      cover_artwork_id:  updates.coverArtworkId,
      is_smart:          updates.isSmart,
      smart_rules:       updates.smartRules,
    })
    .eq('id', albumId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAlbum(albumId) {
  // album_artworks cascade deletes
  const { error } = await supabase.from('albums').delete().eq('id', albumId);
  if (error) throw error;
}

export async function addArtworkToAlbum(albumId, artworkId) {
  const { error } = await supabase
    .from('album_artworks')
    .upsert({ album_id: albumId, artwork_id: artworkId });
  if (error) throw error;
}

export async function removeArtworkFromAlbum(albumId, artworkId) {
  const { error } = await supabase
    .from('album_artworks')
    .delete()
    .eq('album_id', albumId)
    .eq('artwork_id', artworkId);
  if (error) throw error;
}

export async function fetchAlbumArtworks(albumId) {
  const { data, error } = await supabase
    .from('album_artworks')
    .select(`
      sort_order,
      artwork:artwork_id(
        *,
        children(name, avatar_color, avatar_emoji),
        artwork_tags(tag:tag_id(*))
      )
    `)
    .eq('album_id', albumId)
    .order('sort_order');
  if (error) throw error;
  return data.map(d => d.artwork);
}

// ─── Artworks with full joins ─────────────────────────────────────────────────

export async function fetchArtworksForChild(userId, childId, filters = {}) {
  let query = supabase
    .from('artworks')
    .select(`
      *,
      children(id, name, avatar_color, avatar_emoji),
      artwork_tags(
        tag:tag_id(id, name, slug, color, icon)
      )
    `)
    .eq('user_id', userId)
    .order('artwork_date', { ascending: false });

  if (childId && childId !== 'all') query = query.eq('child_id', childId);
  if (filters.grade)      query = query.eq('grade', filters.grade);
  if (filters.schoolYear) query = query.eq('school_year', filters.schoolYear);
  if (filters.tagIds?.length) {
    // Filter by tag — artworks that have ALL specified tags
    for (const tagId of filters.tagIds) {
      query = query.contains('artwork_tags.tag_id', [tagId]);
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  // Flatten tags from nested join
  return data.map(a => ({
    ...a,
    tags: a.artwork_tags?.map(at => at.tag).filter(Boolean) || [],
  }));
}

// ─── Smart Album Resolution ───────────────────────────────────────────────────
// Evaluates smart rules to return matching artworks
export function matchesSmartRules(artwork, rules) {
  if (!rules) return false;

  if (rules.tags?.length) {
    const artworkTagSlugs = artwork.tags?.map(t => t.slug) || [];
    if (!rules.tags.some(slug => artworkTagSlugs.includes(slug))) return false;
  }

  if (rules.grade && artwork.grade !== rules.grade) return false;
  if (rules.schoolYear && artwork.school_year !== rules.schoolYear) return false;
  if (rules.childId && artwork.child_id !== rules.childId) return false;

  if (rules.dateRange) {
    const date = new Date(artwork.artwork_date);
    if (rules.dateRange.from && date < new Date(rules.dateRange.from)) return false;
    if (rules.dateRange.to   && date > new Date(rules.dateRange.to))   return false;
  }

  return true;
}

// ─── Utility ──────────────────────────────────────────────────────────────────
const COLORS = ['#E8640A','#7C3AED','#2563EB','#059669','#DC2626','#D97706','#0891B2','#DB2777'];
let colorIdx = 0;
function pickRandomColor() {
  return COLORS[colorIdx++ % COLORS.length];
}

export function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
