// server/api.js
// Backend API routes — keeps CLIENT_SECRET off the browser
// Use with Express, or convert to Supabase Edge Functions

// ─── Setup ────────────────────────────────────────────────────────────────────
// npm install express @supabase/supabase-js node-fetch dotenv

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import 'dotenv/config';

const app    = express();
const router = express.Router();
app.use(express.json());

// Service-role client — bypasses RLS, server-side only
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const APP_URL = process.env.VITE_APP_URL;

// ─── Auth Middleware ──────────────────────────────────────────────────────────
// Verify the Supabase JWT on every request
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = user;
  next();
}

// ─── OAuth Code Exchange ──────────────────────────────────────────────────────
// POST /api/oauth/exchange
// Body: { provider: 'google_drive' | 'onedrive' | 'dropbox', code: string }
router.post('/oauth/exchange', requireAuth, async (req, res) => {
  const { provider, code } = req.body;

  try {
    let tokens;

    if (provider === 'google_drive') {
      const r = await fetch('https://oauth2.googleapis.com/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id:     process.env.VITE_GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri:  `${APP_URL}/auth/callback/google`,
          grant_type:    'authorization_code',
        }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error_description || d.error);
      tokens = {
        accessToken:  d.access_token,
        refreshToken: d.refresh_token,
        expiresAt:    new Date(Date.now() + d.expires_in * 1000).toISOString(),
      };

    } else if (provider === 'onedrive') {
      const tenantId = process.env.VITE_MICROSOFT_TENANT_ID || 'common';
      const r = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id:     process.env.VITE_MICROSOFT_CLIENT_ID,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET,
          redirect_uri:  `${APP_URL}/auth/callback/onedrive`,
          grant_type:    'authorization_code',
        }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error_description || d.error);
      tokens = {
        accessToken:  d.access_token,
        refreshToken: d.refresh_token,
        expiresAt:    new Date(Date.now() + d.expires_in * 1000).toISOString(),
      };

    } else if (provider === 'dropbox') {
      const r = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id:     process.env.VITE_DROPBOX_APP_KEY,
          client_secret: process.env.DROPBOX_APP_SECRET,
          redirect_uri:  `${APP_URL}/auth/callback/dropbox`,
          grant_type:    'authorization_code',
        }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error_description || d.error);
      tokens = {
        accessToken:  d.access_token,
        refreshToken: d.refresh_token,
        expiresAt:    d.expires_in ? new Date(Date.now() + d.expires_in * 1000).toISOString() : null,
      };

    } else {
      return res.status(400).json({ message: `Unknown provider: ${provider}` });
    }

    // Save tokens to Supabase (encrypted at rest)
    await supabaseAdmin
      .from('cloud_connections')
      .upsert({
        user_id:          req.user.id,
        provider,
        access_token:     tokens.accessToken,
        refresh_token:    tokens.refreshToken,
        token_expires_at: tokens.expiresAt,
        is_active:        true,
      }, { onConflict: 'user_id,provider' });

    res.json({ success: true });

  } catch (err) {
    console.error('OAuth exchange error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─── Get Access Token for Cloud Operation ────────────────────────────────────
// POST /api/cloud/token
// Returns a valid (refreshed if needed) access token for the user+provider
router.post('/cloud/token', requireAuth, async (req, res) => {
  const { provider } = req.body;
  const userId = req.user.id;

  const { data: conn, error } = await supabaseAdmin
    .from('cloud_connections')
    .select('access_token, refresh_token, token_expires_at, provider')
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('is_active', true)
    .single();

  if (error || !conn) {
    return res.status(404).json({ message: 'No connection found for this provider' });
  }

  // Check if token is expired (with 5-minute buffer)
  const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at) : null;
  const isExpired = expiresAt && expiresAt < new Date(Date.now() + 5 * 60 * 1000);

  if (isExpired && conn.refresh_token) {
    try {
      let newTokens;

      if (provider === 'google_drive') {
        const r = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            refresh_token: conn.refresh_token,
            client_id:     process.env.VITE_GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            grant_type:    'refresh_token',
          }),
        });
        const d = await r.json();
        newTokens = { accessToken: d.access_token, expiresAt: new Date(Date.now() + d.expires_in * 1000).toISOString() };

      } else if (provider === 'onedrive') {
        const tenantId = process.env.VITE_MICROSOFT_TENANT_ID || 'common';
        const r = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            refresh_token: conn.refresh_token,
            client_id:     process.env.VITE_MICROSOFT_CLIENT_ID,
            client_secret: process.env.MICROSOFT_CLIENT_SECRET,
            grant_type:    'refresh_token',
          }),
        });
        const d = await r.json();
        newTokens = { accessToken: d.access_token, expiresAt: new Date(Date.now() + d.expires_in * 1000).toISOString() };

      } else if (provider === 'dropbox') {
        const r = await fetch('https://api.dropboxapi.com/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            refresh_token: conn.refresh_token,
            client_id:     process.env.VITE_DROPBOX_APP_KEY,
            client_secret: process.env.DROPBOX_APP_SECRET,
            grant_type:    'refresh_token',
          }),
        });
        const d = await r.json();
        newTokens = { accessToken: d.access_token, expiresAt: new Date(Date.now() + d.expires_in * 1000).toISOString() };
      }

      // Save refreshed token
      await supabaseAdmin
        .from('cloud_connections')
        .update({ access_token: newTokens.accessToken, token_expires_at: newTokens.expiresAt })
        .eq('user_id', userId)
        .eq('provider', provider);

      return res.json({ accessToken: newTokens.accessToken });

    } catch (err) {
      console.error('Token refresh failed:', err);
      return res.status(401).json({ message: 'Token refresh failed — user must reconnect' });
    }
  }

  res.json({ accessToken: conn.access_token });
});

app.use('/api', router);
app.listen(3001, () => console.log('API server running on :3001'));
export default app;
