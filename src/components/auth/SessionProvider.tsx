'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useState, useEffect, type ReactNode } from 'react';

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
 * Fail-open: if the marker is missing but the user IS signed in (e.g. a request
 * that somehow skipped middleware), the worst case is one render as
 * unauthenticated. Guarded below by re-checking after mount.
 */

const SESSION_MARKER = 'au7o.sess';

function hasSessionMarker(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c === `${SESSION_MARKER}=1`);
}

type SessionProviderProps = {
  children: ReactNode;
};

export function SessionProvider({ children }: SessionProviderProps) {
  // Read the marker synchronously on the first client render so the provider
  // mounts with the right value — flipping it later would not re-trigger the
  // fetch, since next-auth's mount effect has an empty dep array.
  const [signedIn] = useState<boolean>(hasSessionMarker);

  // Safety net: if we guessed "anonymous" but a session cookie actually exists,
  // the marker will have been set by the middleware on this very response, so a
  // remount (next navigation) picks it up. Force one immediately instead of
  // leaving a signed-in user looking logged out.
  const [recheck, setRecheck] = useState(0);
  useEffect(() => {
    if (!signedIn && hasSessionMarker()) setRecheck((n) => n + 1);
  }, [signedIn]);

  const known = signedIn || recheck > 0;

  return (
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
  );
}
