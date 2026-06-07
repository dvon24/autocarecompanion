'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

/**
 * "Open Hub" CTA on known-issues article pages. The article is for a
 * specific year/make/model, but a signed-in user almost certainly wants
 * their OWN garage's hub — not a stranger vehicle that happens to share
 * the article subject.
 *
 * Routing:
 *   - Anonymous → `/vehicle/{articleSlug}` (the article's vehicle).
 *     They get a free preview of the hub for the model they're reading
 *     about; signing in later routes them to their saved garage.
 *   - Signed-in → `/` — the homepage redirects logged-in users to their
 *     primary vehicle hub (or /garage if no vehicle on file). That way
 *     the link always goes "to MY hub" once you're logged in.
 *
 * Kept as a client component so the parent article page stays SSG +
 * ISR; only the link target switches client-side after hydration.
 * Anonymous + Googlebot still get a useful crawlable href.
 */
export function OpenHubLink({
  articleSlug,
  className,
  children = 'Open Hub',
}: {
  articleSlug: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const signedIn = status === 'authenticated' && !!session?.user;
  const href = signedIn ? '/' : `/vehicle/${articleSlug}`;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
