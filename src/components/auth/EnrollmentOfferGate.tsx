'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const EnrollmentContext = createContext<boolean | null>(null);

/** UI visibility only; enrollment endpoints independently check trusted geo. */
export function EnrollmentOfferGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const inherited = useContext(EnrollmentContext);
  const [eligible, setEligible] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (inherited !== null) return;
    let controller: AbortController | undefined;
    const refresh = () => {
      controller?.abort();
      controller = new AbortController();
      const current = controller;
      setEligible(false);
      if (document.visibilityState === 'hidden') return;
      fetch('/api/enrollment-eligibility', { cache: 'no-store', credentials: 'same-origin', signal: current.signal })
        .then(async (response) => response.ok && (await response.json()).eligible === true)
        .then((allowed) => {
          if (!current.signal.aborted) {
            setEligible(allowed);
            if (allowed) setShown(true);
          }
        })
        .catch(() => { if (!current.signal.aborted) setEligible(false); });
    };
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller?.abort();
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [inherited]);
  if (inherited !== null) return inherited ? children : fallback;
  // Keep previously mounted drafts while hiding all offer content during
  // revalidation. Nothing is rendered into the initial server HTML.
  return <>
    {shown && <div hidden={!eligible} inert={!eligible} style={{ display: eligible ? 'contents' : 'none' }}>
      <EnrollmentContext.Provider value={true}>{children}</EnrollmentContext.Provider>
    </div>}
    {!eligible && fallback}
  </>;
}
