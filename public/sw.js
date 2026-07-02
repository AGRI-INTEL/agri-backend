const CACHE_NAME = 'agriintel360-v2';
const IMAGE_CACHE = 'agriintel360-images-v1';
const STATIC_CACHE = 'agriintel360-static-v1';

const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/register',
  '/contact',
  '/offline',
  '/offline.html',
  '/manifest.json',
  '/fond-landscape.jpg',
  '/logo.png',
  '/images/icons/vegetal.svg',
  '/images/icons/animal.svg',
  '/images/icons/halieutique.svg',
  '/images/icons/forestier.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const allowedCaches = [CACHE_NAME, IMAGE_CACHE, STATIC_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !allowedCaches.includes(name))
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEAR_CACHES') {
    const keep = event.data.keep || [];
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => !keep.includes(n))
          .map((n) => caches.delete(n))
      )
    );
  }
  if (event.data?.type === 'CLEAR_CACHE' && event.data.name) {
    caches.delete(event.data.name);
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/api/v1/')) {
    event.respondWith(networkFirstWithTimeout(request, 30000));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isImageAsset(url)) {
    event.respondWith(imageCacheFirst(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(staticCacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

function isStaticAsset(url) {
  const extensions = ['.css', '.js', '.woff2', '.woff', '.ttf', '.json'];
  return extensions.some((ext) => url.pathname.endsWith(ext));
}

function isImageAsset(url) {
  const extensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.ico', '.avif'];
  return extensions.some((ext) => url.pathname.endsWith(ext));
}

function limitCacheSize(cache, maxItems) {
  cache.keys().then((keys) => {
    if (keys.length > maxItems) {
      cache.delete(keys[0]).then(() => limitCacheSize(cache, maxItems));
    }
  });
}

async function staticCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.status < 400) {
      const clone = response.clone();
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, clone);
      limitCacheSize(cache, 50);
    }
    return response;
  } catch {
    return caches.match('/offline.html');
  }
}

async function imageCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.status < 400) {
      const clone = response.clone();
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, clone);
      limitCacheSize(cache, 100);
    }
    return response;
  } catch {
    return caches.match('/offline.html');
  }
}

async function networkFirstWithTimeout(request, timeoutMs) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Network timeout')), timeoutMs)
  );
  try {
    const response = await Promise.race([fetch(request), timeoutPromise]);
    if (response.ok) {
      const clone = response.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, clone);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match('/offline.html');
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.status < 400) {
      const clone = response.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, clone);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match('/offline.html');
  }
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.status < 400) {
      const clone = response.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, clone);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match('/offline.html');
  }
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-dashboard') {
    event.waitUntil(refreshDashboardData());
  }
  if (event.tag === 'refresh-notifications') {
    event.waitUntil(refreshNotifications());
  }
});

async function refreshDashboardData() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const urls = [
      '/api/v1/dashboard/kpis',
      '/api/v1/dashboard/production',
      '/api/v1/dashboard/weekly-summary',
    ];
    const responses = await Promise.allSettled(
      urls.map((url) =>
        fetch(url).then((res) => {
          if (res.ok) cache.put(url, res);
        })
      )
    );
    return responses;
  } catch {
    return;
  }
}

async function refreshNotifications() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await fetch('/api/v1/notifications');
    if (res.ok) cache.put('/api/v1/notifications', res);
  } catch {
    return;
  }
}
