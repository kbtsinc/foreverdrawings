// src/lib/supabase.js
// Central Supabase client — import this everywhere

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Missing Supabase environment variables. Copy .env.example to .env and fill in values.');
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    // Store session in localStorage so it persists across page refreshes
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,  // Needed for OAuth callback handling
  },
});

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

export async function signUp({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ─── Artwork Helpers ──────────────────────────────────────────────────────────

export async function fetchArtworks(userId, { childId, grade, schoolYear, limit = 100, offset = 0 } = {}) {
  let query = supabase
    .from('artworks')
    .select(`
      *,
      children (id, name)
    `)
    .eq('user_id', userId)
    .order('artwork_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (childId)    query = query.eq('child_id', childId);
  if (grade)      query = query.eq('grade', grade);
  if (schoolYear) query = query.eq('school_year', schoolYear);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function uploadArtwork(userId, file, metadata) {
  // 1. Upload image to Supabase Storage
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storagePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('artworks')
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: '3600',
    });

  if (uploadError) throw uploadError;

  // 2. Insert artwork record in database
  const { data, error: dbError } = await supabase
    .from('artworks')
    .insert({
      user_id:      userId,
      child_id:     metadata.childId || null,
      title:        metadata.title || 'Untitled',
      description:  metadata.description || null,
      grade:        metadata.grade || null,
      school_year:  metadata.schoolYear || null,
      artwork_date: metadata.artworkDate || new Date().toISOString().split('T')[0],
      storage_path: storagePath,
      file_size:    file.size,
      mime_type:    file.type,
      tags:         metadata.tags || [],
    })
    .select()
    .single();

  if (dbError) {
    // Rollback storage upload if DB insert fails
    await supabase.storage.from('artworks').remove([storagePath]);
    throw dbError;
  }

  return data;
}

export async function deleteArtwork(artworkId, storagePath) {
  // Delete from storage first
  const { error: storageError } = await supabase.storage
    .from('artworks')
    .remove([storagePath]);

  if (storageError) throw storageError;

  // Delete from database (cascade deletes sync_log entries)
  const { error: dbError } = await supabase
    .from('artworks')
    .delete()
    .eq('id', artworkId);

  if (dbError) throw dbError;
}

export function getArtworkUrl(storagePath) {
  const { data } = supabase.storage
    .from('artworks')
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function getArtworkSignedUrl(storagePath, expiresIn = 3600) {
  // Use signed URLs for private buckets
  const { data, error } = await supabase.storage
    .from('artworks')
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

// ─── Children Helpers ─────────────────────────────────────────────────────────

export async function fetchChildren(userId) {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  if (error) throw error;
  return data;
}

export async function addChild(userId, { name, birthYear }) {
  const { data, error } = await supabase
    .from('children')
    .insert({ user_id: userId, name, birth_year: birthYear })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Share Link Helpers ───────────────────────────────────────────────────────

export async function createShareLink(userId, artworkIds, { title, message } = {}) {
  if (artworkIds.length > 5) throw new Error('Maximum 5 artworks per share link');

  const { data, error } = await supabase
    .from('share_links')
    .insert({
      user_id:     userId,
      artwork_ids: artworkIds,
      title,
      message,
      expires_at:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    shareUrl: `${window.location.origin}/share/${data.token}`,
  };
}

export async function fetchShareLink(token) {
  const { data, error } = await supabase
    .from('share_links')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) throw error;

  // Increment view count
  await supabase
    .from('share_links')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', data.id);

  return data;
}

// ─── Cloud Connection Helpers ─────────────────────────────────────────────────

export async function fetchCloudConnections(userId) {
  const { data, error } = await supabase
    .from('cloud_connections')
    .select('id, provider, is_active, last_synced_at, folder_name, token_expires_at')
    .eq('user_id', userId);
  // NOTE: access_token and refresh_token intentionally excluded from client queries
  if (error) throw error;
  return data;
}

export async function saveCloudConnection(userId, provider, tokens) {
  const { data, error } = await supabase
    .from('cloud_connections')
    .upsert({
      user_id:          userId,
      provider,
      access_token:     tokens.accessToken,
      refresh_token:    tokens.refreshToken || null,
      token_expires_at: tokens.expiresAt || null,
      is_active:        true,
    }, { onConflict: 'user_id,provider' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function disconnectCloudProvider(userId, provider) {
  const { error } = await supabase
    .from('cloud_connections')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider);

  if (error) throw error;
}

// ─── Backup Log Helpers ───────────────────────────────────────────────────────

export async function logBackup(userId, type, destination) {
  const { data, error } = await supabase
    .from('backup_log')
    .insert({
      user_id:     userId,
      backup_type: type,
      status:      'running',
      destination,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBackupLog(backupId, { status, artworkCount, totalBytes, errorMessage }) {
  const { error } = await supabase
    .from('backup_log')
    .update({
      status,
      artwork_count: artworkCount,
      total_bytes:   totalBytes,
      error_message: errorMessage,
      completed_at:  new Date().toISOString(),
    })
    .eq('id', backupId);

  if (error) throw error;
}

export async function fetchBackupLog(userId, limit = 10) {
  const { data, error } = await supabase
    .from('backup_log')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
