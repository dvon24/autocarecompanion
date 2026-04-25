import { NextRequest, NextResponse } from 'next/server';
import { knownIssuesLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export const maxDuration = 10;

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/**
 * Autocomplete suggestions for the /drive destination input.
 * Hits Mapbox SearchBox /suggest with the user's location as proximity bias
 * so 'piz...' biases to nearby pizzerias instead of generic global hits.
 *
 * The session_token query param is required by SearchBox for billing —
 * the client passes a stable per-tab UUID so suggest+retrieve calls in the
 * same session count as one billable interaction.
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = knownIssuesLimiter.check(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  if (!MAPBOX_TOKEN) {
    return NextResponse.json({ suggestions: [] });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (q.length < 2) return NextResponse.json({ suggestions: [] });

  const lng = url.searchParams.get('lng');
  const lat = url.searchParams.get('lat');
  const sessionToken = url.searchParams.get('session_token') || crypto.randomUUID();
  const country = (request.headers.get('x-vercel-ip-country') || '').toLowerCase();

  const params = new URLSearchParams({
    q,
    access_token: MAPBOX_TOKEN,
    session_token: sessionToken,
    limit: '6',
    language: 'en',
  });
  if (lng && lat) params.set('proximity', `${lng},${lat}`);
  if (country) params.set('country', country);

  try {
    const res = await fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`);
    if (!res.ok) {
      return NextResponse.json({ suggestions: [], error: `mapbox_${res.status}` });
    }
    const data = await res.json();
    interface RawSuggestion {
      name?: string;
      place_formatted?: string;
      mapbox_id?: string;
      feature_type?: string;
    }
    const suggestions = (data.suggestions || []).slice(0, 6).map((s: RawSuggestion) => ({
      name: s.name || '',
      placeFormatted: s.place_formatted || '',
      mapboxId: s.mapbox_id || '',
      featureType: s.feature_type || '',
    }));
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [], error: 'network' });
  }
}
