// server/emailInbound.js
// Email-to-Vault: receives inbound emails via Postmark or SendGrid webhook
// and automatically saves attached photos to the user's Supabase vault.
//
// HOW IT WORKS:
//   1. Each user gets a unique vault address: vault-{token}@mail.yourdomain.com
//   2. They forward school emails (or email directly) to that address
//   3. This webhook fires, extracts image attachments, uploads to Supabase
//   4. Artwork appears in their vault automatically
//
// SETUP:
//   Postmark: Dashboard → Inbound → set webhook URL to https://yourdomain.com/api/email/inbound
//   SendGrid: Settings → Inbound Parse → add MX record + webhook URL
//   DNS MX record: mail.yourdomain.com → mx.sendgrid.net (or Postmark's MX)

import express     from 'express';
import multer      from 'multer';
import { createClient } from '@supabase/supabase-js';
import crypto      from 'crypto';
import path        from 'path';
import 'dotenv/config';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Service role — needed to upload on behalf of users
);

const EMAIL_DOMAIN  = process.env.EMAIL_DOMAIN || 'mail.yourdomain.com';
const WEBHOOK_TOKEN = process.env.EMAIL_WEBHOOK_TOKEN; // Secret to verify webhook calls

// ─── Mime type validation ─────────────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/heic',
  'image/heif', 'image/webp', 'image/gif', 'image/tiff',
]);

function isAllowedImage(mimeType, filename) {
  if (ALLOWED_IMAGE_TYPES.has(mimeType?.toLowerCase())) return true;
  const ext = path.extname(filename || '').toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp'].includes(ext);
}

// ─── Extract title from email subject ────────────────────────────────────────
function extractTitle(subject, filename) {
  if (!subject) return path.basename(filename || 'Untitled', path.extname(filename || ''));

  // Clean up common email subject patterns
  let title = subject
    .replace(/^(Fwd?|Re):\s*/i, '')         // Remove Fwd: Re:
    .replace(/\s*\[.*?\]\s*/g, '')           // Remove [tags]
    .replace(/artwork|drawing|art|photo/gi, '') // Remove generic words
    .trim();

  return title || path.basename(filename || 'Untitled', path.extname(filename || ''));
}

// ─── Generate user vault email address ───────────────────────────────────────
// Store this token in the user's profile when they sign up
function generateVaultToken(userId) {
  return crypto
    .createHmac('sha256', process.env.VAULT_EMAIL_SECRET || 'fallback-secret')
    .update(userId)
    .digest('hex')
    .slice(0, 16);
}

function getVaultEmail(userId) {
  const token = generateVaultToken(userId);
  return `vault-${token}@${EMAIL_DOMAIN}`;
}

// Reverse lookup: given a vault token from the email address, find the user
async function findUserByVaultToken(token) {
  // We store the vault_token in the profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('vault_email_token', token)
    .single();

  if (error || !data) return null;
  return data.id;
}

// ─── Upload image to Supabase Storage ────────────────────────────────────────
async function saveArtworkFromEmail(userId, { buffer, filename, mimeType, title, artworkDate }) {
  const ext      = path.extname(filename) || '.jpg';
  const safeName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  const storagePath = `${userId}/email/${safeName}`;

  // Upload file buffer to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('artworks')
    .upload(storagePath, buffer, {
      contentType: mimeType || 'image/jpeg',
      cacheControl: '3600',
    });

  if (uploadError) throw uploadError;

  // Insert artwork record
  const { data, error: dbError } = await supabase
    .from('artworks')
    .insert({
      user_id:      userId,
      title:        title || 'Untitled',
      artwork_date: artworkDate || new Date().toISOString().split('T')[0],
      storage_path: storagePath,
      file_size:    buffer.length,
      mime_type:    mimeType,
      tags:         ['email-import'],
    })
    .select()
    .single();

  if (dbError) {
    // Rollback storage
    await supabase.storage.from('artworks').remove([storagePath]);
    throw dbError;
  }

  return data;
}

// ─── Send confirmation email (optional) ──────────────────────────────────────
async function sendConfirmation(toEmail, artworkCount, artworkTitles) {
  // Using Postmark — swap for SendGrid/SES if preferred
  if (!process.env.POSTMARK_API_KEY) return;

  await fetch('https://api.postmarkapp.com/email', {
    method:  'POST',
    headers: {
      'Accept':          'application/json',
      'Content-Type':    'application/json',
      'X-Postmark-Server-Token': process.env.POSTMARK_API_KEY,
    },
    body: JSON.stringify({
      From:     `vault@${EMAIL_DOMAIN}`,
      To:       toEmail,
      Subject:  `✓ ${artworkCount} artwork${artworkCount !== 1 ? 's' : ''} saved to your vault`,
      TextBody: `Your artwork${artworkCount !== 1 ? 's have' : ' has'} been saved to Little Masterpiece!\n\n${artworkTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nView your vault at https://${process.env.VITE_APP_URL?.replace('https://', '') || 'yourdomain.com'}`,
      HtmlBody: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h1 style="color: #2D1B00; font-size: 24px;">🎨 Artwork saved!</h1>
          <p style="color: #8B6040;">The following ${artworkCount > 1 ? `${artworkCount} artworks were` : 'artwork was'} added to your vault:</p>
          <ul style="color: #2D1B00; margin: 16px 0;">
            ${artworkTitles.map(t => `<li style="margin-bottom: 8px;">${t}</li>`).join('')}
          </ul>
          <a href="${process.env.VITE_APP_URL}" style="display: inline-block; background: #E8640A; color: white; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: bold; margin-top: 12px;">View Your Vault →</a>
        </div>
      `,
      MessageStream: 'outbound',
    }),
  });
}

// ─── Postmark Inbound Webhook ─────────────────────────────────────────────────
// POST /api/email/inbound/postmark
router.post('/inbound/postmark', async (req, res) => {
  try {
    const payload = req.body;

    // Extract the vault token from the To address
    // e.g. "vault-abc123def456@mail.yourdomain.com"
    const toAddresses = Array.isArray(payload.ToFull) ? payload.ToFull : [{ Email: payload.To }];
    let userId = null;
    let senderEmail = payload.From || payload.FromFull?.Email || '';

    for (const addr of toAddresses) {
      const match = addr.Email?.match(/^vault-([a-f0-9]{16})@/);
      if (match) {
        userId = await findUserByVaultToken(match[1]);
        if (userId) break;
      }
    }

    if (!userId) {
      console.log('[Email] No matching user for addresses:', toAddresses.map(a => a.Email));
      return res.status(200).json({ message: 'No matching vault — ignored' });
    }

    // Extract image attachments
    const attachments = payload.Attachments || [];
    const images = attachments.filter(att =>
      isAllowedImage(att.ContentType, att.Name)
    );

    if (images.length === 0) {
      console.log('[Email] No image attachments in email from', senderEmail);
      return res.status(200).json({ message: 'No image attachments' });
    }

    const subject     = payload.Subject || '';
    const artworkDate = new Date().toISOString().split('T')[0];
    const savedTitles = [];

    for (const image of images) {
      const buffer = Buffer.from(image.Content, 'base64');
      const title  = extractTitle(subject, image.Name);

      await saveArtworkFromEmail(userId, {
        buffer,
        filename:  image.Name,
        mimeType:  image.ContentType,
        title,
        artworkDate,
      });

      savedTitles.push(title);
    }

    // Send confirmation back to sender
    if (senderEmail) {
      await sendConfirmation(senderEmail, savedTitles.length, savedTitles);
    }

    console.log(`[Email] Saved ${savedTitles.length} artworks for user ${userId}`);
    res.status(200).json({ saved: savedTitles.length });

  } catch (err) {
    console.error('[Email] Inbound webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── SendGrid Inbound Parse Webhook ──────────────────────────────────────────
// POST /api/email/inbound/sendgrid
// SendGrid sends multipart/form-data with attachments as fields
router.post('/inbound/sendgrid', upload.any(), async (req, res) => {
  try {
    const body        = req.body;
    const files       = req.files || [];
    const toEmail     = body.to || '';
    const subject     = body.subject || '';
    const senderEmail = body.from || '';

    // Extract vault token from To address
    const match = toEmail.match(/vault-([a-f0-9]{16})@/);
    if (!match) return res.status(200).json({ message: 'Not a vault address — ignored' });

    const userId = await findUserByVaultToken(match[1]);
    if (!userId) return res.status(200).json({ message: 'No matching vault' });

    // Filter image attachments
    const images = files.filter(f => isAllowedImage(f.mimetype, f.originalname));

    if (images.length === 0) {
      return res.status(200).json({ message: 'No image attachments' });
    }

    const artworkDate = new Date().toISOString().split('T')[0];
    const savedTitles = [];

    for (const img of images) {
      const title = extractTitle(subject, img.originalname);
      await saveArtworkFromEmail(userId, {
        buffer:    img.buffer,
        filename:  img.originalname,
        mimeType:  img.mimetype,
        title,
        artworkDate,
      });
      savedTitles.push(title);
    }

    if (senderEmail) await sendConfirmation(senderEmail, savedTitles.length, savedTitles);

    console.log(`[Email/SendGrid] Saved ${savedTitles.length} artworks for user ${userId}`);
    res.status(200).json({ saved: savedTitles.length });

  } catch (err) {
    console.error('[Email/SendGrid] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Get a user's vault email address ────────────────────────────────────────
// GET /api/email/vault-address  (authenticated)
router.get('/vault-address', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user } } = await supabase.auth.getUser(authHeader.slice(7));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Ensure vault token is stored in profile
  const token = generateVaultToken(user.id);
  await supabase
    .from('profiles')
    .update({ vault_email_token: token })
    .eq('id', user.id);

  res.json({ vaultEmail: getVaultEmail(user.id) });
});

export { router as emailRouter, getVaultEmail, generateVaultToken };
