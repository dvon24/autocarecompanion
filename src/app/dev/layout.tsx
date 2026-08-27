import type { Metadata } from 'next';

/**
 * Internal prototype gallery — never indexable.
 *
 * `/dev` renders concept cards labelled `status: 'prototype'` and links to
 * half-built viewers. Google's AdSense review explicitly rejects sites with
 * "pages under construction or not yet launched", and until 2026-08-27 four
 * of the five /dev pages were fully crawlable ('use client' pages cannot
 * export metadata, so they silently inherited the root layout's indexable
 * default — only /dev/hero had its own noindex).
 *
 * Deliberately NOT added to robots.txt: a Disallow would stop Googlebot
 * fetching the page at all, so it would never SEE this noindex and the URLs
 * could linger as "Indexed, though blocked by robots.txt" — a bucket this
 * property already has 79 pages sitting in. Crawlable + noindex is the
 * combination that actually removes them.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
