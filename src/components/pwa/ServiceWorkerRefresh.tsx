'use client';

import { useEffect } from 'react';

/**
 * Listens for a new service worker taking control (which happens on the
 * next deploy thanks to skipWaiting + clientsClaim in next.config.ts) and
 * forces a one-time soft reload so the user sees the freshly served
 * HTML/JS instead of whatever was cached before the SW upgraded.
 *
 * Without this hook, a user with the PWA already open would keep seeing
 * the old version's UI even after the SW activated — the new SW serves
 * fresh assets to FUTURE requests, but the page that's already loaded
 * stays on its old code until a hard reload. Mobile drivers basically
 * never close the tab, so they end up frozen on whatever shipped the
 * day they first installed.
 *
 * Safety:
 *   - Only fires once per page load (module-scope flag — NOT
 *     sessionStorage, which survives reloads for the tab's whole life and
 *     therefore blocked every deploy after the first one; long-lived PWA
 *     tabs sat on stale bundles whose chunks the new SW had already purged,
 *     yielding ChunkLoadErrors on navigation. 2026-06-12 review finding.)
 *   - Skipped on /drive while actively following — never reload someone
 *     mid-route.
 */
let reloadedThisPageLoad = false;

export function ServiceWorkerRefresh() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const onControllerChange = () => {
      // Don't yank the rug out from under someone driving.
      if (window.location.pathname.startsWith('/drive')) {
        // Stash a flag so /drive can offer a manual refresh button later
        // when the user stops driving.
        try { sessionStorage.setItem('au7o-sw-pending', '1'); } catch { /* ignore */ }
        return;
      }
      // One reload max per page load; the fresh page gets a fresh flag,
      // so the NEXT deploy can reload again.
      if (reloadedThisPageLoad) return;
      reloadedThisPageLoad = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
  }, []);

  return null;
}
