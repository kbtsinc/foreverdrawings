// src/lib/cloudSync/dropbox.js
// Dropbox OAuth2 + API v2

const APP_KEY      = import.meta.env.VITE_DROPBOX_APP_KEY;
const APP_URL      = import.meta.env.VITE_APP_URL;
const REDIRECT_URI = `${APP_URL}/auth/callback/dropbox`;
const FOLDER_PATH  = '/Little Masterpiece';

// ─── OAuth Flow ───────────────────────────────────────────────────────────────

export function getDropboxAuthUrl(state) {
  const params = new URLSearchParams({
    client_id:     APP_KEY,
    response_type: 'code',
    redirect_uri:  REDIRECT_URI,
    token_access_type: 'offline',  // Get refresh token
    state:         state || '',
  });
  return `https://www.dropbox.com/oauth2/authorize?${params}`;
}

// Server-side only
export async function exchangeDropboxCode(code) {
  const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      grant_type:    'authorization_code',
      client_id:     APP_KEY,
      client_secret: process.env.DROPBOX_APP_SECRET,
      redirect_uri:  REDIRECT_URI,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  return {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token,
    expiresAt:    data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : null,
  };
}

export async function refreshDropboxToken(refreshToken) {
  const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
      client_id:     APP_KEY,
      client_secret: process.env.DROPBOX_APP_SECRET,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  return {
    accessToken: data.access_token,
    expiresAt:   new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

// ─── Dropbox API Helpers ──────────────────────────────────────────────────────

async function dropboxRpc(endpoint, accessToken, body) {
  const res = await fetch(`https://api.dropboxapi.com/2/${endpoint}`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_summary || `Dropbox API error: ${res.status}`);
  return data;
}

async function ensureFolderExists(accessToken, folderPath) {
  try {
    await dropboxRpc('files/create_folder_v2', accessToken, {
      path:        folderPath,
      autorename:  false,
    });
  } catch (err) {
    // Folder already exists — that's fine
    if (!err.message?.includes('path/conflict/folder')) {
      throw err;
    }
  }
}

// ─── Sync Functions ───────────────────────────────────────────────────────────

/**
 * Upload a single file to Dropbox
 * Uses upload sessions for files > 150 MB (unlikely for photos, but handled)
 */
export async function uploadFileToDropbox(accessToken, fileBlob, dropboxPath) {
  const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method:  'POST',
    headers: {
      Authorization:       `Bearer ${accessToken}`,
      'Content-Type':      'application/octet-stream',
      'Dropbox-API-Arg':   JSON.stringify({
        path:       dropboxPath,
        mode:       'overwrite',
        autorename: false,
        mute:       false,
      }),
    },
    body: fileBlob,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error_summary || 'Dropbox upload failed');
  }

  const file = await res.json();

  // Get a shared link for the file
  try {
    const link = await dropboxRpc('sharing/create_shared_link_with_settings', accessToken, {
      path:     file.path_lower,
      settings: { requested_visibility: { '.tag': 'public' } },
    });
    return { ...file, sharedLink: link.url };
  } catch {
    return file; // Return without shared link if it fails
  }
}

export async function syncAllToDropbox({ accessToken, artworks, getFileBlob, onProgress }) {
  await ensureFolderExists(accessToken, FOLDER_PATH);
  const results = { success: [], failed: [] };

  for (let i = 0; i < artworks.length; i++) {
    const artwork = artworks[i];
    onProgress?.({ current: i + 1, total: artworks.length, artwork });

    try {
      const blob      = await getFileBlob(artwork.storage_path);
      const safeName  = artwork.title.replace(/[^a-z0-9]/gi, '_');
      const fileName  = `${artwork.artwork_date}-${safeName}.jpg`;
      const dropPath  = `${FOLDER_PATH}/${fileName}`;

      const file = await uploadFileToDropbox(accessToken, blob, dropPath);

      results.success.push({
        artworkId:    artwork.id,
        cloudFileId:  file.id,
        cloudFileUrl: file.sharedLink || null,
      });
    } catch (err) {
      results.failed.push({ artworkId: artwork.id, error: err.message });
    }
  }

  return { folderPath: FOLDER_PATH, results };
}

export async function deleteFromDropbox(accessToken, cloudFilePath) {
  await dropboxRpc('files/delete_v2', accessToken, { path: cloudFilePath });
}
