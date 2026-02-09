'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

/**
 * SessionProvider wrapper for client components
 *
 * Epic 4: User Accounts & Sync
 * Story 4.1: Authentication Setup
 *
 * Wraps the app to provide session context to all client components.
 */

type SessionProviderProps = {
  children: ReactNode;
};

export function SessionProvider({ children }: SessionProviderProps) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
