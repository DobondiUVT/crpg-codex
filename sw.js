/*
 * The CRPG Codex — service worker
 * Bump CACHE_VERSION whenever the app shell changes in a way that must replace cached files.
 */

const CACHE_VERSION = 'v6';
const CACHE_NAME = `crpg-codex-${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data/games.js',
  './data/stores.js',
  './data/scores.js',
  './manifest.webmanifest',
  './assets/favicon.svg',
  './assets/noise.svg',
  './assets/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-192.png',
  './assets/icons/icon-maskable-512.png',
  './assets/og.jpg',
];

const NETWORK_FIRST = /\.(?:html|css|js|webmanifest)$/i;

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME);

  await Promise.all(APP_SHELL.map(async (path) => {
    const request = new Request(new URL(path, self.location.href).href, { cache: 'reload' });
    const response = await fetch(request);
    if (!response.ok) throw new Error(`Could not cache ${path}`);
    await cache.put(request, response);
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    precacheAppShell()
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('crpg-codex-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function putInCache(request, response) {
  if (!response || !response.ok) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function networkFirst(request, fallbackUrl) {
  const fallback = fallbackUrl || request;

  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) {
      await putInCache(request, response);
      return response;
    }

    const cached = await caches.match(fallback, { ignoreSearch: Boolean(fallbackUrl) });
    if (cached) return cached;
    return response;
  } catch (error) {
    const cached = await caches.match(fallback, { ignoreSearch: Boolean(fallbackUrl) });
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  await putInCache(request, response);
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  event.respondWith(
    NETWORK_FIRST.test(url.pathname)
      ? networkFirst(request)
      : cacheFirst(request)
  );
});
