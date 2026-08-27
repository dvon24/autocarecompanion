import type { Metadata } from 'next';

/**
 * Auth pages are never indexable.
 *
 * Four of the five /auth pages are `'use client'`, and a client component
 * cannot export `metadata` — so none of them could declare their own robots
 * directive and they all silently inherited the root layout's indexable
 * default. A layout is a server component, so it can.
 *
 * This duplicates the `X-Robots-Tag: noindex, follow` header set in
 * next.config.ts on purpose. The header is the one that covers /api/auth/*
 * (no HTML head there); this meta tag is the belt-and-braces for the HTML
 * routes and keeps the intent visible where the pages actually live.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
