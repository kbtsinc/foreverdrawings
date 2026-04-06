// src/lib/cloudSync/googleDrive.js
// Google Drive OAuth2 + file sync

const CLIENT_ID    = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APP_URL      = import.meta.env.VITE_APP_URL;
const REDIRECT_URI = `${APP_URL}/auth/callback/google`;
const SCOPES       = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_NAME  = 'Little Masterpiece';

// ─── OAuth Flow ───────────────────────────────────────────────────────────────

export function getGoogleAuthUrl(state) {
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         SCOPES,
    access_type:   'offline',   // Get refresh token
    prompt:        'consent',   // Always show consent to get refresh token
    state:         state || '',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// Called server-side (e.g. Supabase Edge Function) to exchange code for tokens
// NEVER call this client-side — it requires CLIENT_SECRET
export async function exchangeGoogleCode(code) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  return {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token,
    expiresAt:    new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

export async function refreshGoogleToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id:     CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type:    'refresh_token',
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  return {
    accessToken: data.access_token,
    expiresAt:   new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

// ─── Drive API Helpers ────────────────────────────────────────────────────────

async function driveRequest(endpoint, accessToken, options = {}) {
  const res = await fetch(`https://www.googleapis.com/drive/v3${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `Google Drive API error: ${res.status}`);
  }
  return res.json();
}

async function getOrCreateFolder(accessToken, folderName) {
  // Check if folder already exists
  const search = await driveRequest(
    `/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
    accessToken
  );

  if (search.files?.length > 0) {
    return search.files[0].id;
  }

  // Create the folder
  const folder = await driveRequest('/files', accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:     folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  return folder.id;
}

// ─── Sync Functions ───────────────────────────────────────────────────────────

/**
 * Upload a single artwork file to Google Drive
 * @param {string} accessToken - Valid Google OAuth2 access token
 * @param {Blob} fileBlob - The image file
 * @param {string} fileName - Desired filename in Drive
 * @param {string} mimeType - File MIME type
 * @param {string} folderId - Parent folder ID in Drive
 * @returns {object} - Drive file metadata including id and webViewLink
 */
export async function uploadFileToDrive(accessToken, fileBlob, fileName, mimeType, folderId) {
  const metadata = {
    name:    fileName,
    parents: [folderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', fileBlob, fileName);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size',
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body:    form,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Google Drive upload failed');
  }

  return res.json();
}

/**
 * Sync all of a user's artworks to their Google Drive
 * Call this after connecting Google Drive or when user clicks "Sync Now"
 */
export async function syncAllToGoogleDrive({ accessToken, artworks, getFileBlob, onProgress }) {
  // 1. Get or create the Little Masterpiece folder
  const folderId = await getOrCreateFolder(accessToken, FOLDER_NAME);

  const results = { success: [], failed: [] };

  for (let i = 0; i < artworks.length; i++) {
    const artwork = artworks[i];
    onProgress?.({ current: i + 1, total: artworks.length, artwork });

    try {
      const blob = await getFileBlob(artwork.storage_path);
      const fileName = `${artwork.artwork_date}-${artwork.title.replace(/[^a-z0-9]/gi, '_')}.jpg`;

      const driveFile = await uploadFileToDrive(
        accessToken,
        blob,
        fileName,
        artwork.mime_type || 'image/jpeg',
        folderId
      );

      results.success.push({ artworkId: artwork.id, cloudFileId: driveFile.id, cloudFileUrl: driveFile.webViewLink });
    } catch (err) {
      results.failed.push({ artworkId: artwork.id, error: err.message });
    }
  }

  return { folderId, results };
}

/**
 * Delete a file from Google Drive by its Drive file ID
 */
export async function deleteFromDrive(accessToken, cloudFileId) {
  await driveRequest(`/files/${cloudFileId}`, accessToken, { method: 'DELETE' });
}
