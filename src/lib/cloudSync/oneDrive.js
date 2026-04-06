// src/lib/cloudSync/oneDrive.js
// Microsoft OneDrive via Microsoft Graph API

const CLIENT_ID   = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
const TENANT_ID   = import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common';
const APP_URL     = import.meta.env.VITE_APP_URL;
const REDIRECT_URI = `${APP_URL}/auth/callback/onedrive`;
const SCOPES      = 'Files.ReadWrite offline_access';
const FOLDER_NAME = 'Little Masterpiece';

// ─── OAuth Flow ───────────────────────────────────────────────────────────────

export function getOneDriveAuthUrl(state) {
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    response_type: 'code',
    redirect_uri:  REDIRECT_URI,
    scope:         SCOPES,
    response_mode: 'query',
    state:         state || '',
  });
  return `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?${params}`;
}

// Server-side only
export async function exchangeOneDriveCode(code) {
  const res = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
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

export async function refreshOneDriveToken(refreshToken) {
  const res = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id:     CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
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

// ─── Graph API Helpers ────────────────────────────────────────────────────────

async function graphRequest(endpoint, accessToken, options = {}) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  // 204 No Content (e.g. delete) returns empty body
  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Microsoft Graph error: ${res.status}`);
  return data;
}

async function getOrCreateFolder(accessToken, folderName) {
  // Try to get the folder first
  try {
    const folder = await graphRequest(
      `/me/drive/root:/${folderName}`,
      accessToken
    );
    return folder.id;
  } catch {
    // Folder doesn't exist, create it
    const folder = await graphRequest('/me/drive/root/children', accessToken, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name:                              folderName,
        folder:                            {},
        '@microsoft.graph.conflictBehavior': 'rename',
      }),
    });
    return folder.id;
  }
}

// ─── Sync Functions ───────────────────────────────────────────────────────────

/**
 * Upload a single file to OneDrive
 * Uses simple upload for files < 4MB (typical for photos)
 * For larger files, use uploadSession (chunked upload)
 */
export async function uploadFileToOneDrive(accessToken, fileBlob, fileName, folderId) {
  const fileSizeMB = fileBlob.size / (1024 * 1024);

  if (fileSizeMB < 4) {
    // Simple upload
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}:/${encodeURIComponent(fileName)}:/content`,
      {
        method:  'PUT',
        headers: {
          Authorization:  `Bearer ${accessToken}`,
          'Content-Type': fileBlob.type || 'image/jpeg',
        },
        body: fileBlob,
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'OneDrive upload failed');
    }
    return res.json();
  } else {
    // Chunked upload session for large files
    const session = await graphRequest(
      `/me/drive/items/${folderId}:/${encodeURIComponent(fileName)}:/createUploadSession`,
      accessToken,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ item: { '@microsoft.graph.conflictBehavior': 'replace' } }),
      }
    );

    const uploadUrl = session.uploadUrl;
    const chunkSize = 3.2 * 1024 * 1024; // 3.2 MB chunks
    let start = 0;

    while (start < fileBlob.size) {
      const end   = Math.min(start + chunkSize, fileBlob.size);
      const chunk = fileBlob.slice(start, end);

      const res = await fetch(uploadUrl, {
        method:  'PUT',
        headers: {
          'Content-Range': `bytes ${start}-${end - 1}/${fileBlob.size}`,
          'Content-Length': chunk.size,
        },
        body: chunk,
      });

      if (res.status === 201 || res.status === 200) {
        return res.json(); // Upload complete
      }

      start = end;
    }
  }
}

export async function syncAllToOneDrive({ accessToken, artworks, getFileBlob, onProgress }) {
  const folderId = await getOrCreateFolder(accessToken, FOLDER_NAME);
  const results  = { success: [], failed: [] };

  for (let i = 0; i < artworks.length; i++) {
    const artwork = artworks[i];
    onProgress?.({ current: i + 1, total: artworks.length, artwork });

    try {
      const blob     = await getFileBlob(artwork.storage_path);
      const fileName = `${artwork.artwork_date}-${artwork.title.replace(/[^a-z0-9]/gi, '_')}.jpg`;
      const file     = await uploadFileToOneDrive(accessToken, blob, fileName, folderId);

      results.success.push({
        artworkId:    artwork.id,
        cloudFileId:  file.id,
        cloudFileUrl: file.webUrl,
      });
    } catch (err) {
      results.failed.push({ artworkId: artwork.id, error: err.message });
    }
  }

  return { folderId, results };
}

export async function deleteFromOneDrive(accessToken, cloudFileId) {
  await graphRequest(`/me/drive/items/${cloudFileId}`, accessToken, { method: 'DELETE' });
}
