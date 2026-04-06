// public/sw.js
// Service Worker for Little Masterpiece PWA
// Handles: caching, offline support, background sync, share target, push notifications

const APP_VERSION    = 'v1.0.0';
const STATIC_CACHE   = `masterpiece-static-${APP_VERSION}`;
const DYNAMIC_CACHE  = `masterpiece-dynamic-${APP_VERSION}`;
const IMAGE_CACHE    = `masterpiece-images-${APP_VERSION}`;
const UPLOAD_QUEUE   = 'masterpiece-upload-queue';

// Files to cache immediately on install (app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing', APP_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating', APP_VERSION);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== IMAGE_CACHE)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim()) // Take control of all open tabs
  );
});

// ─── Fetch Strategy ───────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache Supabase API calls or OAuth flows
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('microsoftonline.com') ||
      url.pathname.startsWith('/auth/callback')) {
    return; // Let them go to network normally
  }

  // Handle share target POST (receiving photos from camera roll)
  if (url.pathname === '/share-target' && request.method === 'POST') {
    event.respondWith(handleShareTarget(request));
    return;
  }

  // Images: Cache-first with network fallback (artworks load fast offline)
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Static assets: Cache-first
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // JS/CSS bundles: Stale-while-revalidate
  if (url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    return;
  }

  // Navigation (HTML pages): Network-first, fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Everything else: Network-first
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// ─── Cache Strategies ─────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached || fetchPromise;
}

// ─── Share Target Handler ─────────────────────────────────────────────────────
// Called when user shares a photo FROM their camera roll TO the app
async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const files    = formData.getAll('artwork');
    const title    = formData.get('title') || '';

    // Store files in IndexedDB for the app to pick up
    await storeSharedFiles(files, title);

    // Redirect to app with flag to trigger upload UI
    return Response.redirect('/?shared=true', 303);
  } catch (err) {
    console.error('[SW] Share target error:', err);
    return Response.redirect('/?share_error=true', 303);
  }
}

// Store shared files in IndexedDB
function storeSharedFiles(files, title) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('masterpiece-share', 1);

    request.onupgradeneeded = e => {
      e.target.result.createObjectStore('pending', { autoIncrement: true });
    };

    request.onsuccess = e => {
      const db    = e.target.result;
      const tx    = db.transaction('pending', 'readwrite');
      const store = tx.objectStore('pending');

      files.forEach(file => {
        store.add({ file, title, timestamp: Date.now() });
      });

      tx.oncomplete = resolve;
      tx.onerror    = reject;
    };

    request.onerror = reject;
  });
}

// ─── Background Sync ──────────────────────────────────────────────────────────
// Retries failed uploads when connection is restored
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'upload-artwork') {
    event.waitUntil(retryPendingUploads());
  }

  if (event.tag === 'cloud-sync') {
    event.waitUntil(triggerCloudSync());
  }
});

async function retryPendingUploads() {
  // Notify all open app windows to retry their queued uploads
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage({ type: 'RETRY_UPLOADS' });
  });
}

async function triggerCloudSync() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_TO_CLOUD' });
  });
}

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  console.log('[SW] Push received:', data);

  const options = {
    body:    data.body || 'Your vault has been updated',
    icon:    '/icons/icon-192.png',
    badge:   '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data:    { url: data.url || '/', artworkId: data.artworkId },
    actions: [
      { action: 'view',    title: '🖼️ View Artwork' },
      { action: 'dismiss', title: 'Dismiss'          },
    ],
    tag:             data.tag || 'default',
    renotify:        true,
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Little Masterpiece', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // If app is already open, focus it
      const existing = clients.find(c => c.url.includes(self.location.origin));
      if (existing) {
        existing.focus();
        existing.postMessage({ type: 'NAVIGATE', url });
      } else {
        self.clients.openWindow(url);
      }
    })
  );
});

// ─── Message Handler ──────────────────────────────────────────────────────────
// App can send messages to the SW
self.addEventListener('message', event => {
  const { type, payload } = event.data || {};

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (type === 'CACHE_ARTWORK') {
    // Pre-cache a specific artwork image
    caches.open(IMAGE_CACHE).then(cache => cache.add(payload.url));
  }

  if (type === 'CLEAR_IMAGE_CACHE') {
    caches.delete(IMAGE_CACHE).then(() => {
      event.source?.postMessage({ type: 'IMAGE_CACHE_CLEARED' });
    });
  }
});

console.log('[SW] Service worker loaded', APP_VERSION);
