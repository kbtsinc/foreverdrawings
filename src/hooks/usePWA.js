// src/hooks/usePWA.js
// Handles all PWA functionality:
// - Service worker registration
// - Install prompt (Add to Home Screen)
// - Share target (receiving photos from camera roll)
// - Offline upload queue with background sync
// - Push notification subscription

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── IndexedDB helpers for offline upload queue ───────────────────────────────
const DB_NAME    = 'masterpiece-offline';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('upload_queue')) {
        db.createObjectStore('upload_queue', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pending_share')) {
        db.createObjectStore('pending_share', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess  = e => resolve(e.target.result);
    req.onerror    = e => reject(e.target.error);
  });
}

async function queueUpload(item) {
  const db    = await openDB();
  const tx    = db.transaction('upload_queue', 'readwrite');
  const store = tx.objectStore('upload_queue');
  return new Promise((res, rej) => {
    const req  = store.add({ ...item, queuedAt: Date.now(), status: 'pending' });
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}

async function getQueuedUploads() {
  const db    = await openDB();
  const tx    = db.transaction('upload_queue', 'readonly');
  const store = tx.objectStore('upload_queue');
  return new Promise((res, rej) => {
    const req  = store.getAll();
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}

async function removeFromQueue(id) {
  const db    = await openDB();
  const tx    = db.transaction('upload_queue', 'readwrite');
  const store = tx.objectStore('upload_queue');
  return new Promise((res, rej) => {
    const req  = store.delete(id);
    req.onsuccess = () => res();
    req.onerror   = () => rej(req.error);
  });
}

async function getPendingSharedFiles() {
  const db    = await openDB();
  const tx    = db.transaction('pending_share', 'readwrite');
  const store = tx.objectStore('pending_share');
  return new Promise((res, rej) => {
    const req = store.getAll();
    req.onsuccess = async () => {
      const items = req.result;
      // Clear them after reading
      if (items.length > 0) {
        const clearReq = store.clear();
        clearReq.onsuccess = () => res(items);
        clearReq.onerror   = () => res(items);
      } else {
        res(items);
      }
    };
    req.onerror = () => rej(req.error);
  });
}

// ─── Main Hook ────────────────────────────────────────────────────────────────
export function usePWA({ onUploadReady, userId } = {}) {
  const [swRegistration,  setSwRegistration]  = useState(null);
  const [installPrompt,   setInstallPrompt]   = useState(null);  // BeforeInstallPromptEvent
  const [isInstalled,     setIsInstalled]     = useState(false);
  const [isOnline,        setIsOnline]        = useState(navigator.onLine);
  const [queueCount,      setQueueCount]      = useState(0);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [pushEnabled,     setPushEnabled]     = useState(false);
  const uploadFnRef = useRef(null);

  // Keep upload function ref current
  useEffect(() => { uploadFnRef.current = onUploadReady; }, [onUploadReady]);

  // ── Service Worker Registration ──────────────────────────────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('[PWA] SW registered');
        setSwRegistration(reg);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch(err => console.error('[PWA] SW registration failed:', err));

    // Listen for messages from SW
    navigator.serviceWorker.addEventListener('message', event => {
      const { type } = event.data || {};
      if (type === 'RETRY_UPLOADS')  flushUploadQueue();
      if (type === 'SYNC_TO_CLOUD')  window.dispatchEvent(new CustomEvent('cloud-sync'));
      if (type === 'NAVIGATE')       window.location.href = event.data.url;
    });
  }, []);

  // ── Online / Offline ─────────────────────────────────────────────────────
  useEffect(() => {
    const goOnline  = () => { setIsOnline(true);  flushUploadQueue(); };
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // ── Install Prompt ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = e => {
      e.preventDefault();       // Don't show browser's default prompt yet
      setInstallPrompt(e);      // Save it to trigger manually
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const handler = () => setIsInstalled(true);
    window.addEventListener('appinstalled', handler);

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  // ── Share Target — check for incoming shared photos ──────────────────────
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('shared') === 'true') {
      // Photos were shared to the app — pull from IndexedDB (written by SW)
      getPendingSharedFiles().then(items => {
        if (items.length > 0 && uploadFnRef.current) {
          uploadFnRef.current(items.map(i => i.file), i.title || '');
        }
      });
      // Clean the URL
      url.searchParams.delete('shared');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // ── Queue count ──────────────────────────────────────────────────────────
  useEffect(() => {
    getQueuedUploads().then(items => setQueueCount(items.length));
  }, []);

  // ── Push notification permission ─────────────────────────────────────────
  useEffect(() => {
    if ('Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Show the native Add to Home Screen prompt */
  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setInstallPrompt(null);
    return outcome === 'accepted';
  }, [installPrompt]);

  /** Queue a file for upload (used when offline) */
  const addToUploadQueue = useCallback(async (file, metadata) => {
    // Convert file to ArrayBuffer for IndexedDB storage
    const buffer   = await file.arrayBuffer();
    const id       = await queueUpload({ buffer, name: file.name, type: file.type, metadata });
    setQueueCount(c => c + 1);

    // Register background sync so it retries when online
    if (swRegistration && 'sync' in swRegistration) {
      await swRegistration.sync.register('upload-artwork');
    }

    return id;
  }, [swRegistration]);

  /** Flush the offline upload queue */
  const flushUploadQueue = useCallback(async () => {
    if (!isOnline || !uploadFnRef.current) return;
    const items = await getQueuedUploads();
    if (items.length === 0) return;

    for (const item of items) {
      try {
        const blob = new Blob([item.buffer], { type: item.type });
        const file = new File([blob], item.name, { type: item.type });
        await uploadFnRef.current([file], item.metadata);
        await removeFromQueue(item.id);
        setQueueCount(c => Math.max(0, c - 1));
      } catch (err) {
        console.error('[PWA] Queue flush failed for item', item.id, err);
      }
    }
  }, [isOnline]);

  /** Request push notification permission + subscribe */
  const enablePushNotifications = useCallback(async () => {
    if (!swRegistration || !('PushManager' in window)) {
      throw new Error('Push not supported on this device');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Permission denied');

    // Subscribe to push
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    // Send subscription to your server to store against this user
    await fetch('/api/push/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId, subscription }),
    });

    setPushEnabled(true);
    return subscription;
  }, [swRegistration, userId]);

  /** Apply a waiting service worker update */
  const applyUpdate = useCallback(() => {
    swRegistration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }, [swRegistration]);

  return {
    isInstalled,
    isOnline,
    canInstall: !!installPrompt && !isInstalled,
    promptInstall,
    queueCount,
    addToUploadQueue,
    flushUploadQueue,
    pushEnabled,
    enablePushNotifications,
    updateAvailable,
    applyUpdate,
    swRegistration,
  };
}

// Convert VAPID key for PushManager
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}
