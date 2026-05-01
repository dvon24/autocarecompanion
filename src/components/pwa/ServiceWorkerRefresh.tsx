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
 *   - Only fires once per page load (sessionStorage guard).
 *   - Skipped on /drive while actively following — never reload someone
 *     mid-route.
 */
export function ServiceWorkerRefresh() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const RELOAD_KEY = 'au7o-sw-reloaded';

    const onControllerChange = () => {
      // Don't yank the rug out from under someone driving.
      if (window.location.pathname.startsWith('/drive')) {
        // Stash a flag so /drive can offer a manual refresh button later
        // when the user stops driving.
        try { sessionStorage.setItem('au7o-sw-pending', '1'); } catch { /* ignore */ }
        return;
      }
      // One reload max per session.
      try {
        if (sessionStorage.getItem(RELOAD_KEY) === '1') return;
        sessionStorage.setItem(RELOAD_KEY, '1');
      } catch { /* ignore */ }
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
  }, []);

  return null;
}
