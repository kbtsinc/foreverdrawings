// src/lib/cloudSync/index.js
// Unified sync orchestrator — call this, don't call providers directly

import { supabase, fetchCloudConnections, saveCloudConnection,
         disconnectCloudProvider, logBackup, updateBackupLog } from '../supabase.js';
import { getGoogleAuthUrl, syncAllToGoogleDrive }  from './googleDrive.js';
import { getOneDriveAuthUrl, syncAllToOneDrive }   from './oneDrive.js';
import { getDropboxAuthUrl,  syncAllToDropbox }    from './dropbox.js';

// ─── Provider Config ──────────────────────────────────────────────────────────
export const PROVIDERS = {
  google_drive: {
    id:         'google_drive',
    label:      'Google Drive',
    icon:       '🟦',
    color:      '#4285F4',
    getAuthUrl: getGoogleAuthUrl,
    syncAll:    syncAllToGoogleDrive,
  },
  onedrive: {
    id:         'onedrive',
    label:      'OneDrive',
    icon:       '⊞',
    color:      '#0078D4',
    getAuthUrl: getOneDriveAuthUrl,
    syncAll:    syncAllToOneDrive,
  },
  dropbox: {
    id:         'dropbox',
    label:      'Dropbox',
    icon:       '⬡',
    color:      '#0061FF',
    getAuthUrl: getDropboxAuthUrl,
    syncAll:    syncAllToDropbox,
  },
};

// ─── Connect a Provider ───────────────────────────────────────────────────────
/**
 * Initiates OAuth flow for a given provider.
 * Stores the current user ID in sessionStorage so the callback can retrieve it.
 * Then redirects to the provider's auth page.
 */
export function connectProvider(providerId, userId) {
  const provider = PROVIDERS[providerId];
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);

  // Store state so we can verify on callback
  const state = btoa(JSON.stringify({ userId, provider: providerId, ts: Date.now() }));
  sessionStorage.setItem('oauth_state', state);

  const authUrl = provider.getAuthUrl(state);
  window.location.href = authUrl;
}

// ─── Handle OAuth Callback ────────────────────────────────────────────────────
/**
 * Call this on your /auth/callback/:provider route.
 * Exchanges the code for tokens via your backend API endpoint,
 * then saves the connection to Supabase.
 */
export async function handleOAuthCallback(providerId, code, state) {
  // 1. Verify state
  const storedState = sessionStorage.getItem('oauth_state');
  if (state !== storedState) throw new Error('OAuth state mismatch — possible CSRF');

  const { userId } = JSON.parse(atob(state));
  sessionStorage.removeItem('oauth_state');

  // 2. Exchange code for tokens via YOUR backend
  // This must go through your server to keep CLIENT_SECRET safe
  const res = await fetch('/api/oauth/exchange', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ provider: providerId, code }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Token exchange failed');
  }

  const tokens = await res.json();

  // 3. Save to Supabase
  await saveCloudConnection(userId, providerId, tokens);

  return { userId, provider: providerId };
}

// ─── Get Blob from Supabase Storage ──────────────────────────────────────────
async function getSupabaseFileBlob(storagePath) {
  const { data, error } = await supabase.storage
    .from('artworks')
    .download(storagePath);
  if (error) throw error;
  return data; // Returns a Blob
}

// ─── Sync a User's Artworks to a Provider ────────────────────────────────────
/**
 * Main sync function — called when user clicks "Sync Now" or on upload
 * @param {string} userId
 * @param {string} providerId - 'google_drive' | 'onedrive' | 'dropbox'
 * @param {Array}  artworks - array of artwork objects from Supabase
 * @param {function} onProgress - callback({ current, total, artwork })
 */
export async function syncToProvider(userId, providerId, artworks, onProgress) {
  const provider = PROVIDERS[providerId];
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);

  // 1. Get stored connection (access token)
  // Note: We fetch the token via a server-side function for security
  const tokenRes = await fetch('/api/cloud/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ userId, provider: providerId }),
  });

  if (!tokenRes.ok) throw new Error('Could not retrieve cloud token');
  const { accessToken } = await tokenRes.json();

  // 2. Log the sync start
  const backup = await logBackup(userId, 'manual', providerId);

  // 3. Run the sync
  try {
    const { results } = await provider.syncAll({
      accessToken,
      artworks,
      getFileBlob: getSupabaseFileBlob,
      onProgress,
    });

    // 4. Write sync log entries
    const successEntries = results.success.map(r => ({
      user_id:       userId,
      artwork_id:    r.artworkId,
      provider:      providerId,
      cloud_file_id: r.cloudFileId,
      cloud_file_url: r.cloudFileUrl,
      status:        'success',
    }));

    if (successEntries.length > 0) {
      await supabase.from('sync_log').upsert(successEntries, { onConflict: 'artwork_id,provider' });
    }

    const failedEntries = results.failed.map(r => ({
      user_id:       userId,
      artwork_id:    r.artworkId,
      provider:      providerId,
      status:        'failed',
      error_message: r.error,
    }));

    if (failedEntries.length > 0) {
      await supabase.from('sync_log').upsert(failedEntries, { onConflict: 'artwork_id,provider' });
    }

    // 5. Update connection last_synced_at
    await supabase
      .from('cloud_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('provider', providerId);

    // 6. Update backup log
    await updateBackupLog(backup.id, {
      status:       results.failed.length === 0 ? 'success' : 'failed',
      artworkCount: artworks.length,
    });

    return results;

  } catch (err) {
    await updateBackupLog(backup.id, { status: 'failed', errorMessage: err.message });
    throw err;
  }
}

// ─── Sync Newly Uploaded Artwork to All Connected Providers ──────────────────
/**
 * Call this right after uploading a new artwork
 * Automatically syncs to all connected cloud providers
 */
export async function syncNewArtworkToAll(userId, artwork) {
  const connections = await fetchCloudConnections(userId);
  const active = connections.filter(c => c.is_active);

  await Promise.allSettled(
    active.map(conn => syncToProvider(userId, conn.provider, [artwork], null))
  );
}

export { fetchCloudConnections, disconnectCloudProvider };
