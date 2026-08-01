import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hasAuthSessionCookie, SESSION_MARKER } from '@/lib/session-marker';

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

  return sessionMarker(req, NextResponse.next());
}

/**
 * Session marker cookie.
 *
 * next-auth's SessionProvider fires GET /api/auth/session on mount whenever it
 * isn't handed an initial session — so EVERY page view, including the anonymous
 * known-issues traffic that will never log in, was costing a serverless
 * invocation to be told "no session". At ~117K page views/month that is pure
 * waste, and it is the burst visible in the Vercel request logs.
 *
 * The real session token is httpOnly, so the client cannot check it directly.
 * This mirrors its EXISTENCE (never its value) into a readable marker so the
 * provider can skip the round-trip for anonymous visitors. See
 * components/auth/SessionProvider.tsx for the other half.
 *
 * Deliberately carries no identity: it is exactly "1" or absent.
 */
function sessionMarker(req: NextRequest, res: NextResponse): NextResponse {
  const signedIn = hasAuthSessionCookie(req.cookies.getAll().map((cookie) => cookie.name));
  const marked = req.cookies.get(SESSION_MARKER)?.value === '1';

  if (signedIn && !marked) {
    res.cookies.set(SESSION_MARKER, '1', {
      httpOnly: false, // the client must be able to read it — that is the point
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  } else if (!signedIn && marked) {
    // Signed out (or the session expired) — clear it so we stop fetching.
    res.cookies.set(SESSION_MARKER, '', { path: '/', maxAge: 0 });
  }
  return res;
}

export const config = {
  // Runs on page routes so the session marker stays in sync everywhere.
  // Excludes API routes, Next internals and any path with a file extension, so
  // static assets are untouched. Edge middleware is far cheaper than the
  // serverless /api/auth/session invocation it saves, and it still runs on
  // ISR-cached responses — so cached pages keep their cache and get the cookie.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)'],
};
