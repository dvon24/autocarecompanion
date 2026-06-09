import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Redirects for stale/mangled known-issues URLs that Google already indexed.
 *
 * The Citroën rename (citroën → citroen) left old URLs live in Google's index
 * where the "ë" had been slugified to "-n-" (e.g. /known-issues/citro-n-c4) or
 * left as a literal ë on the make page. Those old URLs match no vehicle now and
 * render as soft-404s. We 308-redirect them to the canonical citroen- slug so
 * the link equity flows and the soft-404s drop on recrawl.
 *
 * next.config.ts handles the two FIXED-tail cases that path-to-regexp can parse
 * (/make/citro-n, /dtc/:code/citro-n); the wildcard transforms that broke the
 * build live here, where we can rewrite the pathname as a plain string.
 */
export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // Make page with a literal ë (decoded or percent-encoded).
  if (pathname === '/known-issues/make/citroën' || pathname === '/known-issues/make/citro%C3%ABn') {
    const url = req.nextUrl.clone();
    url.pathname = '/known-issues/make/citroen';
    return NextResponse.redirect(url, 308);
  }

  // Any known-issues path with the mangled "citro-n-" segment → "citroen-".
  // Covers base vehicle pages (?year= preserved automatically) and DTC tails.
  if (pathname.includes('citro-n-')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/citro-n-/g, 'citroen-');
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Only run on known-issues URLs — everything else skips the middleware.
  matcher: ['/known-issues/:path*'],
};
