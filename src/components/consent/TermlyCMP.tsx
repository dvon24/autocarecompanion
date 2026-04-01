'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const SCRIPT_SRC_BASE = 'https://app.termly.io';
const WEBSITE_UUID = 'f4e5ba89-66d6-4eb6-92f0-b9827653b2e8';

declare global {
  interface Window {
    Termly?: { initialize: () => void };
  }
}

/**
 * Termly Consent Management Platform (CMP)
 *
 * Handles GDPR/CCPA cookie consent banner.
 * Re-initializes on route changes for SPA navigation.
 */
function TermlyCMPInner() {
  const scriptSrc = useMemo(() => {
    const src = new URL(SCRIPT_SRC_BASE);
    src.pathname = `/resource-blocker/${WEBSITE_UUID}`;
    src.searchParams.set('autoBlock', 'on');
    return src.toString();
  }, []);

  const isScriptAdded = useRef(false);

  useEffect(() => {
    if (isScriptAdded.current) return;
    const script = document.createElement('script');
    script.src = scriptSrc;
    document.head.appendChild(script);
    isScriptAdded.current = true;
  }, [scriptSrc]);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.Termly?.initialize();
  }, [pathname, searchParams]);

  return null;
}

export default function TermlyCMP() {
  return (
    <Suspense fallback={null}>
      <TermlyCMPInner />
    </Suspense>
  );
}
