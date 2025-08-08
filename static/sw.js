// Simple Service Worker for Driplo Marketplace
// Focuses on caching critical assets and API responses

// Development mode check
const isDev = self.location.hostname === 'localhost';

// Logger for service worker (dev only)
const swLogger = {
  log: (...args) => isDev && console.log('[SW]', ...args),
  error: (...args) => isDev && console.error('[SW ERROR]', ...args)
};

const CACHE_NAME = 'driplo-cache-v1';
const STATIC_CACHE = 'driplo-static-v1';

// Critical assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/browse',
  '/_app/immutable/entry/start.js',
  '/_app/immutable/entry/app.js',
  '/_app/immutable/assets/app.css',
  '/favicon.ico'
];

// API endpoints to cache with strategy
const CACHE_API_PATTERNS = [
  '/api/categories',
  '/api/brands',
  '/api/conditions',
  '/api/listings/featured',
  '/api/listings/popular'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      swLogger.log('Caching critical assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            swLogger.log('Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different request types
  if (isStaticAsset(url.pathname)) {
    // Cache first for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isAPIRequest(url.pathname)) {
    // Stale while revalidate for API requests
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
  } else if (isPageRequest(url.pathname)) {
    // Network first for pages (with cache fallback)
    event.respondWith(networkFirst(request, CACHE_NAME));
  }
});

// Cache strategies

async function cacheFirst(request, cacheName) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    swLogger.error('Cache first failed', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    swLogger.log('Network failed, trying cache');
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => {
    // Network failed - return cached version if available
    return cached;
  });

  // Return cached version immediately if available
  return cached || fetchPromise;
}

// Helper functions

function isStaticAsset(pathname) {
  return pathname.startsWith('/_app/') || 
         pathname.includes('.') && (
           pathname.endsWith('.js') ||
           pathname.endsWith('.css') ||
           pathname.endsWith('.ico') ||
           pathname.endsWith('.png') ||
           pathname.endsWith('.jpg') ||
           pathname.endsWith('.webp')
         );
}

function isAPIRequest(pathname) {
  return pathname.startsWith('/api/') || 
         CACHE_API_PATTERNS.some(pattern => pathname.includes(pattern));
}

function isPageRequest(pathname) {
  return !pathname.startsWith('/api/') && 
         !pathname.startsWith('/_app/') &&
         !pathname.includes('.');
}

// Background sync for failed requests (optional enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Could implement queued request retry here
  swLogger.log('Background sync triggered');
}