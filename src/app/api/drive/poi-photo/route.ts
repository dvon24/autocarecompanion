import { NextRequest, NextResponse } from 'next/server';
import { knownIssuesLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export const maxDuration = 15;

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * Server-side proxy for Google Places Photos so the API key never reaches
 * the browser. Client passes the photo `name` (e.g. "places/X/photos/Y")
 * returned from /api/drive/poi-rich-details + a max width/height; we hit
 * Google's media endpoint and stream the bytes back.
 *
 * Edge-cached at the CDN with `s-maxage=86400` — photo refs themselves
 * are stable for the lifetime of the place, and per-Place Photo billing
 * means we want to amortize hits aggressively.
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = knownIssuesLimiter.check(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  if (!GOOGLE_KEY) {
    return NextResponse.json({ error: 'not_configured' }, { status: 501 });
  }

  const { searchParams } = new URL(request.url);
  const name = (searchParams.get('name') || '').trim();
  // Strict allowlist on the path shape — refuse anything that isn't a
  // Google photo reference. Stops the proxy from being weaponised to
  // fetch arbitrary URLs.
  if (!name.startsWith('places/') || !name.includes('/photos/') || name.length > 200) {
    return NextResponse.json({ error: 'bad_name' }, { status: 400 });
  }

  // Clamp dimensions so a malicious caller can't make us pay for 4K images.
  const w = clamp(parseInt(searchParams.get('w') || '400', 10), 80, 1200);
  const h = clamp(parseInt(searchParams.get('h') || '400', 10), 80, 1200);

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${w}&maxHeightPx=${h}&key=${GOOGLE_KEY}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) {
      return NextResponse.json({ error: `google_${res.status}` }, { status: 502 });
    }
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // 24h CDN cache — photo refs don't change for a place.
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err) {
    console.warn('[poi-photo] proxy error:', err);
    return NextResponse.json({ error: 'network' }, { status: 502 });
  }
}

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}
