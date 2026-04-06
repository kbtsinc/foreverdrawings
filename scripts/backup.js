#!/usr/bin/env node
// scripts/backup.js
// Manual or scheduled backup: pg_dump + Supabase Storage snapshot
// Run: node scripts/backup.js
// Schedule with cron: 0 2 * * * /usr/bin/node /path/to/scripts/backup.js

import { execSync }  from 'child_process';
import { createClient } from '@supabase/supabase-js';
import fs    from 'fs';
import path  from 'path';
import 'dotenv/config';

// ─── Config ───────────────────────────────────────────────────────────────────
const BACKUP_DIR     = process.env.BACKUP_DIR    || './backups';
const DB_URL         = process.env.SUPABASE_DB_URL;
const SUPABASE_URL   = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Optional: upload backup to S3-compatible storage
const S3_BUCKET      = process.env.BACKUP_S3_BUCKET;
const S3_REGION      = process.env.BACKUP_S3_REGION  || 'us-east-1';
const S3_ACCESS_KEY  = process.env.BACKUP_S3_ACCESS_KEY;
const S3_SECRET_KEY  = process.env.BACKUP_S3_SECRET_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Step 1: Database Dump ────────────────────────────────────────────────────
async function backupDatabase(backupPath) {
  if (!DB_URL) {
    log('⚠️  SUPABASE_DB_URL not set — skipping database backup');
    return null;
  }

  const dumpFile = path.join(backupPath, 'database.sql');
  log(`📦 Running pg_dump → ${dumpFile}`);

  try {
    execSync(
      `pg_dump "${DB_URL}" \
        --no-owner \
        --no-acl \
        --schema=public \
        --file="${dumpFile}"`,
      { stdio: 'inherit' }
    );

    const stats = fs.statSync(dumpFile);
    log(`✅ Database dump complete: ${(stats.size / 1024).toFixed(1)} KB`);
    return dumpFile;
  } catch (err) {
    log(`❌ pg_dump failed: ${err.message}`);
    log('   Make sure postgresql-client is installed: apt-get install postgresql-client');
    return null;
  }
}

// ─── Step 2: Storage Snapshot ─────────────────────────────────────────────────
// Downloads all artwork files from Supabase Storage
async function backupStorage(backupPath) {
  const storageDir = path.join(backupPath, 'storage');
  ensureDir(storageDir);

  log('🖼️  Starting Supabase Storage backup...');

  // List all files in the artworks bucket
  const { data: files, error } = await supabase.storage
    .from('artworks')
    .list('', { limit: 10000, sortBy: { column: 'created_at', order: 'asc' } });

  if (error) {
    log(`❌ Storage list failed: ${error.message}`);
    return;
  }

  log(`   Found ${files.length} top-level items in artworks bucket`);

  let downloaded = 0;
  let failed = 0;

  // List files per user folder
  for (const folder of files) {
    if (!folder.id) continue; // Skip if not a folder

    const { data: userFiles } = await supabase.storage
      .from('artworks')
      .list(folder.name, { limit: 10000 });

    if (!userFiles) continue;

    const userDir = path.join(storageDir, folder.name);
    ensureDir(userDir);

    for (const file of userFiles) {
      const filePath = `${folder.name}/${file.name}`;
      const localPath = path.join(userDir, file.name);

      // Skip if already downloaded (incremental)
      if (fs.existsSync(localPath)) {
        downloaded++;
        continue;
      }

      try {
        const { data: blob, error: dlErr } = await supabase.storage
          .from('artworks')
          .download(filePath);

        if (dlErr) throw dlErr;

        const buffer = Buffer.from(await blob.arrayBuffer());
        fs.writeFileSync(localPath, buffer);
        downloaded++;
      } catch (err) {
        log(`   ⚠️  Failed to download ${filePath}: ${err.message}`);
        failed++;
      }
    }
  }

  log(`✅ Storage backup complete: ${downloaded} files downloaded, ${failed} failed`);
  return storageDir;
}

// ─── Step 3: Backup Metadata JSON ────────────────────────────────────────────
async function backupMetadata(backupPath) {
  log('📋 Exporting artwork metadata as JSON...');

  const { data: artworks, error } = await supabase
    .from('artworks')
    .select('*')
    .order('created_at');

  if (error) {
    log(`❌ Metadata export failed: ${error.message}`);
    return;
  }

  const metaFile = path.join(backupPath, 'artworks.json');
  fs.writeFileSync(metaFile, JSON.stringify(artworks, null, 2));
  log(`✅ Metadata exported: ${artworks.length} artworks → ${metaFile}`);
}

// ─── Step 4: Upload to S3 (optional) ─────────────────────────────────────────
async function uploadToS3(backupPath, backupName) {
  if (!S3_BUCKET || !S3_ACCESS_KEY) {
    log('ℹ️  S3 backup not configured — skipping upload');
    return;
  }

  log(`☁️  Uploading to S3: s3://${S3_BUCKET}/backups/${backupName}`);

  try {
    // Requires aws-cli: npm install -g aws-cli or brew install awscli
    execSync(
      `AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY}" \
       AWS_SECRET_ACCESS_KEY="${S3_SECRET_KEY}" \
       aws s3 sync "${backupPath}" \
         "s3://${S3_BUCKET}/backups/${backupName}" \
         --region "${S3_REGION}" \
         --quiet`,
      { stdio: 'inherit' }
    );
    log(`✅ Uploaded to S3`);
  } catch (err) {
    log(`❌ S3 upload failed: ${err.message}`);
    log('   Make sure AWS CLI is installed and configured');
  }
}

// ─── Step 5: Rotate Old Backups ───────────────────────────────────────────────
function rotateOldBackups(keepDays = 30) {
  log(`🗑️  Rotating backups older than ${keepDays} days...`);
  const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;
  let removed = 0;

  if (!fs.existsSync(BACKUP_DIR)) return;

  for (const entry of fs.readdirSync(BACKUP_DIR)) {
    const full = path.join(BACKUP_DIR, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && stat.birthtimeMs < cutoff) {
      fs.rmSync(full, { recursive: true });
      removed++;
    }
  }

  log(`   Removed ${removed} old backup(s)`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const backupName = `backup-${timestamp()}`;
  const backupPath = path.join(BACKUP_DIR, backupName);

  ensureDir(backupPath);
  log(`\n🎨 Little Masterpiece Backup — ${backupName}`);
  log('='.repeat(60));

  const startTime = Date.now();

  await backupDatabase(backupPath);
  await backupStorage(backupPath);
  await backupMetadata(backupPath);
  await uploadToS3(backupPath, backupName);
  rotateOldBackups(30);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log('='.repeat(60));
  log(`✅ Backup complete in ${elapsed}s → ${backupPath}`);
}

main().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});
