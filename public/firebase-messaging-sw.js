importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// ─── Init ─────────────────────────────────────────────────────────────────────

firebase.initializeApp({
    apiKey: "AIzaSyBfKMYA8p0VccEuiO6smhQLXGc7imseWeA",
    authDomain: "thelivingdesk-b6c76.firebaseapp.com",
    projectId: "thelivingdesk-b6c76",
    storageBucket: "thelivingdesk-b6c76.firebasestorage.app",
    messagingSenderId: "583820206179",
    appId: "1:583820206179:web:1fcf5f019f22691ec91856",
});

const messaging = firebase.messaging();

// ─── Lifecycle: take control immediately on install ───────────────────────────
// Without these, a newly installed SW sits in "waiting" state until all tabs
// are closed — which means getToken() in FcmHandler.tsx gets called before
// the SW is actually active, and FCM silently returns no token.

self.addEventListener('install', (event) => {
    console.log('[sw.js] Installing…');
    // Skip the waiting phase so this SW activates immediately.
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('[sw.js] Activated — claiming clients.');
    // Claim all open tabs so they use this SW without needing a reload.
    event.waitUntil(self.clients.claim());
});

// ─── Background Message Handler (FCM SDK path) ────────────────────────────────
// Fires when:
//   • The tab is closed / in background
//   • The message comes via FCM's data-only or notification payload
//
// The FCM SDK intercepts the raw 'push' event internally and calls this
// callback INSTEAD of letting it bubble to our own 'push' listener below.
// So for FCM-routed messages, only ONE of these two handlers will run.

messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] onBackgroundMessage received:', payload);

    // FCM can deliver purely data payloads (no .notification key).
    // Handle both cases so you never silently drop a message.
    const title = payload.notification?.title
        ?? payload.data?.title
        ?? 'The Living Desk';

    const body = payload.notification?.body
        ?? payload.data?.body
        ?? 'You have a new booking update.';

    return self.registration.showNotification(title, {
        body,
        icon: '/logo.png',
        badge: '/logo.png',
        // 'tag' collapses duplicate notifications — same tag = replace, not stack.
        tag: 'tld-booking-notification',
        // Keep the notification visible until the user explicitly dismisses it.
        requireInteraction: true,
        // Carry the click destination so notificationclick can use it.
        data: {
            url: payload.data?.url ?? '/',
        },
    });
});

// ─── Raw Push Handler (safety net for non-FCM pushes) ─────────────────────────
// This fires for push events that are NOT routed through the FCM SDK —
// e.g. direct Web Push API calls, or payloads where FCM SDK bails early.
//
// To avoid double-notifications with onBackgroundMessage, we guard with
// a flag that the FCM SDK sets on the event when it handles it first.
// If the SDK has already handled it, `event.data` will be consumed/empty
// or the SDK sets `event.__handled`. We use a try/catch as the real guard.

self.addEventListener('push', (event) => {
    // If there's no data at all, nothing to show.
    if (!event.data) return;

    let payload;
    try {
        payload = event.data.json();
    } catch {
        // Malformed payload — log and exit.
        console.warn('[sw.js] push event had non-JSON data:', event.data.text());
        return;
    }

    // FCM wraps its own messages in a specific shape. If the FCM SDK's
    // onBackgroundMessage handler already ran, the notification was already
    // shown — bail to avoid duplicates.
    // The FCM compat SDK marks handled events via an internal flag; the
    // safest public signal is checking for the FCM-specific `gcm` wrapper key.
    if (payload.gcm_message_id || payload['google.c.a.e']) {
        // FCM SDK owns this one — onBackgroundMessage already handled it.
        return;
    }

    console.log('[sw.js] Raw push event (non-FCM):', payload);

    const title = payload.notification?.title ?? 'The Living Desk';
    const body = payload.notification?.body ?? 'You have a new update.';

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: 'tld-booking-notification',
            requireInteraction: true,
            data: { url: payload.data?.url ?? '/' },
        })
    );
});

// ─── Notification Click Handler ───────────────────────────────────────────────
// Without this, tapping a notification on iOS PWA / Android does nothing.
// This opens (or focuses) the app and navigates to the relevant URL.

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url ?? '/';

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If a tab is already open, focus it and navigate.
                for (const client of clientList) {
                    if ('focus' in client) {
                        client.focus();
                        // postMessage lets the React app handle the navigation client-side
                        // (avoids a full page reload if the app is already loaded).
                        client.postMessage({ type: 'NOTIFICATION_CLICK', url: targetUrl });
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