'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    Termly?: { initialize: () => void };
  }
}

/**
 * Termly SPA route-change re-initializer.
 *
 * The initial script load happens via <TermlyConsentBootstrap /> in
 * <head> with strategy="beforeInteractive". That component handles the
 * one-time load; this client component handles subsequent SPA navigation
 * by calling `window.Termly.initialize()` on every route change so the
 * banner's scope refreshes for the new URL.
 *
 * Wrapped in Suspense because `useSearchParams()` triggers Next.js's
 * SSR-bailout warning if not wrapped — Suspense lets the rest of the
 * tree static-render while this part falls through to client hydration.
 */
function TermlyRouteReinitInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.Termly?.initialize();
  }, [pathname, searchParams]);

  return null;
}

export default function TermlyRouteReinit() {
  return (
    <Suspense fallback={null}>
      <TermlyRouteReinitInner />
    </Suspense>
  );
}
