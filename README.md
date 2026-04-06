# Forever Drawings

> Preserve every drawing, forever.

A vault for your child's school artwork — organized by child, tagged by grade and holiday, backed up to your personal cloud storage.

**foreverdrawings.com**

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Fill in your values — see Build Guide for where to get each one
```

### 3. Run locally
```bash
# Frontend (in one terminal)
npm run dev

# Backend API (in another terminal)
npm run server
```

Open http://localhost:5173

---

## Project Structure

```
src/
  components/       UI components
  hooks/            usePWA.js — service worker, install prompt, offline queue
  lib/              Supabase queries, brand copy, cloud sync
    cloudSync/      Google Drive, OneDrive, Dropbox
public/
  manifest.json     PWA manifest
  sw.js             Service worker
  offline.html      Offline fallback
  icons/            App icons (generate with pwa-asset-generator)
server/
  api.js            Express API — OAuth, token refresh
  emailInbound.js   Email-to-vault webhook (Postmark + SendGrid)
supabase/
  migrations/       Run these in order in Supabase SQL Editor
scripts/
  backup.js         Nightly backup — pg_dump + storage + S3
```

---

## Deployment

| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Railway | Backend API server |
| Supabase | Database + file storage |
| Postmark | Inbound email processing |

See the **Forever Drawings Build Guide** (ForeverDrawings_BuildGuide.docx) for full step-by-step deployment instructions.

---

## Key Features

- Multi-child support with per-child vaults
- Albums — manual and smart (auto-populated by tags)
- Tags — grade levels, holidays, seasons, custom
- Cloud sync — Google Drive, OneDrive, Dropbox (each user connects their own account)
- Email-to-vault — forward school emails, photos save automatically
- PWA — installs on iPhone and Android home screen
- Share links — share up to 5 drawings with a time-limited link
- Nightly backups — pg_dump + storage snapshots

---

*© 2026 Forever Drawings — foreverdrawings.com*
