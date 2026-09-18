'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { SESSION_MARKER } from '@/lib/session-marker';

/**
 * SessionProvider wrapper for client components
 *
 * Epic 4: User Accounts & Sync
 * Story 4.1: Authentication Setup
 *
 * Wraps the app to provide session context to all client components.
 *
 * ── Why this isn't just <NextAuthSessionProvider> ──────────────────────────
 * next-auth v5's provider calls GET /api/auth/session on mount whenever it is
 * not given an initial session. This layout wraps every page, so every
 * anonymous known-issues reader — the bulk of our traffic, none of whom will
 * ever log in — cost one serverless invocation per page view to be told they
 * have no session.
 *
 * Passing `session={null}` (rather than leaving it undefined) makes the
 * provider treat "no session" as known: in react.js `_getSession()` bails out
 * early when `_session` is not undefined, and the window-focus refetch bails on
 * `_session === null` too. Consumers get status "unauthenticated", which is the
 * correct answer for an anonymous visitor — just without the round-trip.
 *
 * We can't read the real session token (httpOnly), so middleware mirrors its
 * existence into a readable `au7o.sess` marker. See src/middleware.ts.
 *
 * Read the marker after hydration. Consumers that redirect anonymous users
 * must wait for useSessionMarkerReady() before acting on that initial status.
 */

function hasSessionMarker(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c === `${SESSION_MARKER}=1`);
}

type SessionProviderProps = {
  children: ReactNode;
};

const SessionMarkerReadyContext = createContext(false);

export function useSessionMarkerReady(): boolean {
  return useContext(SessionMarkerReadyContext);
}

export function SessionProvider({ children }: SessionProviderProps) {
  // Server and initial client render must agree. Reading document.cookie in
  // the initializer made signed-in browsers render a loading avatar where the
  // server rendered nothing, replacing the account tree during hydration.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSignedIn(hasSessionMarker());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // The key below deliberately remounts next-auth after marker detection;
  // changing only its session prop would not rerun its initial session fetch.
  const known = signedIn === true;

  return (
    <SessionMarkerReadyContext.Provider value={signedIn !== null}>
      <NextAuthSessionProvider
        key={known ? 'authed' : 'anon'}
        // undefined => provider fetches (signed in, needs the real session)
        // null      => provider skips the fetch (anonymous, answer already known)
        session={known ? undefined : null}
        // Anonymous users need no refetch at all; signed-in users still get one
        // via the normal mount fetch. This kills focus-driven request storms.
        refetchOnWindowFocus={known}
      >
        {children}
      </NextAuthSessionProvider>
    </SessionMarkerReadyContext.Provider>
  );
}
