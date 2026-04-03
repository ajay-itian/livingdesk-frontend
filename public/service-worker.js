// ─── The Living Desk — Service Worker ────────────────────────────────────────
// Handles: caching, offline fallback, background sync, push notifications.
// Keep this file at: /public/service-worker.js
//
// NOTE: /public/firebase-messaging-sw.js handles FCM-specific push messages.
//       This SW handles everything else (caching, offline, non-FCM pushes).
//       Both files must exist side-by-side in /public/.
// ─────────────────────────────────────────────────────────────────────────────

const APP_VERSION   = "v1.0.0";
const CACHE_STATIC  = `tld-static-${APP_VERSION}`;
const CACHE_DYNAMIC = `tld-dynamic-${APP_VERSION}`;
const CACHE_API     = `tld-api-${APP_VERSION}`;

// ─── Assets to pre-cache on install ──────────────────────────────────────────
// These are the minimum files needed to render the app shell offline.
// Next.js generates hashed filenames — add the non-hashed public assets here;
// let the dynamic cache handle _next/static/* chunks automatically.

const STATIC_ASSETS = [
  "/",
  "/booking",
  "/offline",           // Create pages/offline.tsx as your offline fallback page
  "/logo.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/manifest.json",
];

// ─── API routes to cache with a "network first, cache fallback" strategy ─────
const API_CACHE_PATTERNS = [
  /\/api\/rooms/,       // Room list — safe to serve stale
];

// ─── Routes that must NEVER be served from cache ─────────────────────────────
const NEVER_CACHE = [
  /\/api\/bookings/,    // Booking creation / availability — must be live
  /\/api\/payments/,    // Payment intents — must be live
  /firebase/,           // Firebase SDK requests
  /firebaseapp/,
  /googleapis/,
];

// ─────────────────────────────────────────────────────────────────────────────
// INSTALL — pre-cache the app shell
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  console.log(`[SW] Installing ${APP_VERSION}…`);

  event.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then((cache) => {
        // addAll fails atomically — if any asset 404s, the whole install fails.
        // Use individual add() calls with try/catch for resilience.
        return Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] Failed to pre-cache ${url}:`, err.message);
            })
          )
        );
      })
      .then(() => {
        console.log(`[SW] Pre-cache complete.`);
        // Activate immediately — don't wait for tabs to close.
        return self.skipWaiting();
      })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVATE — delete stale caches from previous versions
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  console.log(`[SW] Activating ${APP_VERSION}…`);

  const currentCaches = [CACHE_STATIC, CACHE_DYNAMIC, CACHE_API];

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !currentCaches.includes(key))
            .map((key) => {
              console.log(`[SW] Deleting old cache: ${key}`);
              return caches.delete(key);
            })
        )
      )
      .then(() => {
        console.log(`[SW] Claiming all clients.`);
        // Take control of all open tabs immediately.
        return self.clients.claim();
      })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// FETCH — routing logic
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests — POST/PUT/DELETE go straight to the network.
  if (request.method !== "GET") return;

  // Skip cross-origin requests (CDN, analytics, etc.)
  if (url.origin !== self.location.origin) return;

  // Skip routes that must never be cached.
  if (NEVER_CACHE.some((pattern) => pattern.test(url.pathname))) return;

  // ── Strategy 1: Cache First → for static Next.js assets (hashed filenames)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // ── Strategy 2: Network First → for API routes we're OK to serve stale
  if (API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirst(request, CACHE_API));
    return;
  }

  // ── Strategy 3: Stale While Revalidate → for app shell pages
  if (
    url.pathname === "/" ||
    url.pathname.startsWith("/booking") ||
    url.pathname.startsWith("/my-bookings")
  ) {
    event.respondWith(staleWhileRevalidate(request, CACHE_DYNAMIC));
    return;
  }

  // ── Strategy 4: Network with offline fallback → everything else
  event.respondWith(networkWithOfflineFallback(request));
});

// ─────────────────────────────────────────────────────────────────────────────
// Caching Strategies
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cache First: serve from cache, fetch from network only on miss.
 * Best for: hashed static assets that never change.
 */
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
    return new Response("Offline", { status: 503 });
  }
}

/**
 * Network First: try network, fall back to cache.
 * Best for: API data that should be fresh but can be stale in a pinch.
 */
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
    if (cached) {
      console.log(`[SW] Network failed, serving stale: ${request.url}`);
      return cached;
    }
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Stale While Revalidate: serve cache immediately, update cache in background.
 * Best for: app shell pages — instant load, always fresh next visit.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Kick off a background fetch regardless.
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  // Return cached immediately if available, otherwise wait for network.
  return cached ?? fetchPromise;
}

/**
 * Network with offline fallback: standard fetch, show /offline on failure.
 * Best for: everything else.
 */
async function networkWithOfflineFallback(request) {
  try {
    return await fetch(request);
  } catch {
    // For navigation requests (HTML pages), serve the offline page.
    if (request.destination === "document") {
      const offline = await caches.match("/offline");
      if (offline) return offline;
    }
    return new Response("You are offline.", { status: 503 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUSH — non-FCM push notifications (safety net)
// FCM push messages are handled by firebase-messaging-sw.js.
// This listener catches any Web Push API calls made directly to the browser.
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { title: "The Living Desk", body: event.data.text() } };
  }

  // If it looks like an FCM message, let firebase-messaging-sw.js own it.
  if (payload.gcm_message_id || payload["google.c.a.e"]) return;

  const title   = payload.notification?.title ?? "The Living Desk";
  const body    = payload.notification?.body  ?? "You have a new update.";
  const destUrl = payload.data?.url           ?? "/";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:               "/icons/icon-192x192.png",
      badge:              "/icons/icon-192x192.png",
      tag:                "tld-notification",
      requireInteraction: true,
      data:               { url: destUrl },
    })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION CLICK — open or focus the app
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // If a tab is already open, focus it and send a client-side navigation
        // message so React Router / Next.js router handles it without a reload.
        for (const client of clients) {
          if ("focus" in client) {
            client.focus();
            client.postMessage({ type: "NOTIFICATION_CLICK", url: targetUrl });
            return;
          }
        }
        // No open tab — open a new one.
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND SYNC — retry failed bookings when connectivity is restored
// Register with: await navigator.serviceWorker.ready.then(sw => sw.sync.register('retry-booking'))
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener("sync", (event) => {
  if (event.tag === "retry-booking") {
    console.log("[SW] Background sync: retrying pending bookings…");
    event.waitUntil(retryPendingBookings());
  }
});

async function retryPendingBookings() {
  // Read any pending booking payloads stored in IndexedDB or Cache.
  // This is a stub — wire it to your IndexedDB store when you implement
  // offline booking queuing in the frontend.
  try {
    const cache   = await caches.open("tld-pending-bookings");
    const pending = await cache.keys();

    for (const req of pending) {
      try {
        const stored  = await cache.match(req);
        const payload = await stored.json();

        const res = await fetch("/api/bookings/", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        });

        if (res.ok) {
          await cache.delete(req);
          console.log("[SW] Pending booking synced successfully.");
        }
      } catch (err) {
        console.warn("[SW] Retry failed, will try again:", err.message);
      }
    }
  } catch (err) {
    console.error("[SW] Background sync error:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE — handle commands from the React app
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener("message", (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    // Force the SW to skip waiting and activate immediately.
    // Call from the app when you detect a new SW is waiting:
    // navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    // Clear all caches (e.g., on logout or hard refresh).
    case "CLEAR_CACHE":
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
      break;

    default:
      break;
  }
});
