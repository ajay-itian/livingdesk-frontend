"use client";

import { useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { useToast } from "@/hooks/use-toast";

const firebaseConfig = {
    apiKey: "AIzaSyBfKMYA8p0VccEuiO6smhQLXGc7imseWeA",
    authDomain: "thelivingdesk-b6c76.firebaseapp.com",
    projectId: "thelivingdesk-b6c76",
    storageBucket: "thelivingdesk-b6c76.firebasestorage.app",
    messagingSenderId: "583820206179",
    appId: "1:583820206179:web:1fcf5f019f22691ec91856",
    measurementId: "G-KR8GH6JEXB",
};

const VAPID_KEY =
    "BOgwi_Yxw353DDZfHdZK0lk79wLnKzh-DbcdtdlNNtrrFo-A1lJP5pI3oNNg_byZhR6hEFpNtFCsbgCb58oE-zg";

// ─── Safari / iOS Detection Helpers ──────────────────────────────────────────

/**
 * Returns true if the current browser is Safari (desktop or iOS).
 * Does NOT include Chrome/Firefox on iOS — they all use WebKit under the hood
 * but expose different UA strings.
 */
function isSafariBrowser(): boolean {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    // Safari UA contains "Safari" but NOT "Chrome" or "CriOS" (Chrome iOS)
    return /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
}

/**
 * Returns true when running on iOS (iPhone / iPad / iPod).
 */
function isIos(): boolean {
    if (typeof navigator === "undefined") return false;
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

/**
 * iOS Web Push only works when the PWA is installed to the home screen.
 * `navigator.standalone` is an Apple extension; it's `true` when launched
 * from the home screen.
 */
function isRunningAsInstalledPwa(): boolean {
    return (
        typeof window !== "undefined" &&
        (window.navigator as any).standalone === true
    );
}

/**
 * Extract the major iOS version from the UA string.
 * Returns 0 if it cannot be determined.
 */
function getIosVersion(): number {
    const match = navigator.userAgent.match(/OS (\d+)_/);
    return match ? parseInt(match[1], 10) : 0;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export default function FcmHandler() {
    const { toast } = useToast();

    useEffect(() => {
        const run = async () => {
            // ── Gate 1: Service Workers are a hard requirement for FCM web push ──
            if (!("serviceWorker" in navigator)) {
                console.info("[FCM] Service Workers not supported — skipping push setup.");
                return;
            }

            // ── Gate 2: iOS-specific checks ──────────────────────────────────────
            if (isIos()) {
                const version = getIosVersion();

                // iOS < 16.4 has zero support for Web Push, even as a PWA.
                if (version < 16) {
                    console.info(`[FCM] iOS ${version} detected — Web Push not supported. Skipping.`);
                    return;
                }

                // iOS 16.4+ supports Web Push ONLY when installed to the home screen.
                if (!isRunningAsInstalledPwa()) {
                    console.info("[FCM] iOS PWA not installed — Web Push unavailable in browser tabs on iOS.");
                    // Optionally prompt the user to install the PWA.
                    // You can show a banner here if you want. Example:
                    // toast({ title: "Add to Home Screen", description: "Install this app to receive booking notifications.", duration: 8000 });
                    return;
                }
            }

            // ── Gate 3: Ask Firebase if messaging is supported in this environment ──
            // `isSupported()` performs a capability check (IndexedDB, SW, etc.)
            // It returns false on Safari < 16.4 and non-PWA iOS, avoiding the throw.
            const supported = await isSupported();
            if (!supported) {
                console.info("[FCM] Firebase Messaging not supported in this browser/environment.");
                return;
            }

            try {
                // ── Init Firebase (guard against double-init in dev with HMR) ──────
                const app =
                    getApps().length > 0
                        ? getApps()[0]
                        : initializeApp(firebaseConfig);

                const messaging = getMessaging(app);

                // ── Request notification permission ──────────────────────────────
                // On Safari, this MUST be triggered by a user gesture (click/tap).
                // If this component mounts outside of a gesture handler, Safari will
                // silently deny or throw. Move permission request into a user-action
                // callback if you see "NotAllowedError" on Safari.
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    console.info("[FCM] Notification permission not granted.");
                    return;
                }

                // ── Register / reuse the service worker ──────────────────────────
                const registration = await navigator.serviceWorker.register(
                    "/firebase-messaging-sw.js",
                    { scope: "/" }
                );
                // Wait until the SW is active before requesting a token.
                await navigator.serviceWorker.ready;

                // ── Retrieve the FCM token ────────────────────────────────────────
                // On macOS Safari with APNs-backed Web Push, the token format differs
                // but Firebase SDK ≥ 9.x handles the translation transparently.
                const token = await getToken(messaging, {
                    vapidKey: VAPID_KEY,
                    serviceWorkerRegistration: registration,
                });

                if (token) {
                    console.info("[FCM] Token acquired:", token);
                    localStorage.setItem("fcm_token", token);
                } else {
                    console.warn("[FCM] No token returned — user may have blocked notifications at OS level.");
                }

                // ── Handle foreground messages ────────────────────────────────────
                // Background messages are handled by the service worker; this only
                // fires when the tab is in the foreground.
                onMessage(messaging, (payload) => {
                    console.info("[FCM] Foreground message received:", payload);
                    if (payload.notification) {
                        toast({
                            title: payload.notification.title ?? "New Notification",
                            description: payload.notification.body ?? "",
                            duration: 5000,
                        });
                    }
                });
            } catch (error: any) {
                // Swallow non-critical errors so they don't crash the booking UI.
                // Log them for observability (swap console.error for your error tracker).
                console.error("[FCM] Initialization error:", error?.message ?? error);
            }
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

// ─── Notes for The Living Desk team ──────────────────────────────────────────
//
// Safari / iOS compatibility matrix:
//
// | Environment                        | Web Push Support |
// |------------------------------------|------------------|
// | Chrome / Firefox / Edge (desktop)  | ✅ Full          |
// | macOS Safari 16+                   | ✅ Full          |
// | macOS Safari < 16                  | ❌ None          |
// | iOS Safari 16.4+ (PWA installed)   | ✅ Full          |
// | iOS Safari 16.4+ (browser tab)     | ❌ None          |
// | iOS Safari < 16.4                  | ❌ None          |
// | Chrome on iOS (any version)        | ❌ None*         |
//
// * Chrome/Firefox on iOS are WKWebView wrappers — they use the same engine
//   as Safari and inherit the same push restrictions. FCM token acquisition
//   will fail silently for these.
//
// Recommendation: Show an "Add to Home Screen" prompt on iOS 16.4+ to
// unlock notifications for that user segment. Libraries like `react-pwa-install`
// make this straightforward.
//
// Service Worker note for Safari:
// The SW file at /public/firebase-messaging-sw.js must importScripts from the
// compat CDN URL, not the modular SDK, because Safari's SW environment does
// not support ES module workers yet:
//
//   importScripts("https://www.gstatic.com/firebasejs/10.x.x/firebase-app-compat.js");
//   importScripts("https://www.gstatic.com/firebasejs/10.x.x/firebase-messaging-compat.js");
//