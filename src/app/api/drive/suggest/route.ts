import { NextRequest, NextResponse } from 'next/server';
import { knownIssuesLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export const maxDuration = 10;

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/**
 * Autocomplete suggestions for the /drive destination input.
 *
 * Two actions, switched via ?action=:
 *   - action=suggest (default): SearchBox /suggest returns up to 6 candidate
 *     places matching the query, biased to user proximity + IP country.
 *   - action=retrieve: SearchBox /retrieve returns the exact coordinates +
 *     full address for a specific mapbox_id picked by the user. Skips the
 *     ambiguous re-geocoding step that was sending 'Öhringen' to 'Böhringen'.
 *
 * The session_token query param is required by SearchBox for billing —
 * the client passes a stable per-tab UUID so suggest+retrieve in one session
 * count as one billable interaction.
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = knownIssuesLimiter.check(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  if (!MAPBOX_TOKEN) {
    return NextResponse.json({ suggestions: [] });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'suggest';
  const sessionToken = url.searchParams.get('session_token') || crypto.randomUUID();

  if (action === 'retrieve') {
    const id = (url.searchParams.get('id') || '').trim();
    if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
    try {
      const params = new URLSearchParams({ access_token: MAPBOX_TOKEN, session_token: sessionToken });
      const res = await fetch(`https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(id)}?${params.toString()}`);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return NextResponse.json({ error: `mapbox_${res.status}`, message: text.slice(0, 200) }, { status: 502 });
      }
      const data = await res.json();
      interface RetrieveFeature {
        geometry?: { coordinates?: [number, number] };
        properties?: { name?: string; full_address?: string; place_formatted?: string };
      }
      const feat = (data.features || [])[0] as RetrieveFeature | undefined;
      const coords = feat?.geometry?.coordinates;
      if (!feat || !coords) return NextResponse.json({ error: 'no_result' }, { status: 404 });
      return NextResponse.json({
        lng: coords[0],
        lat: coords[1],
        name: feat.properties?.name || '',
        placeName: feat.properties?.full_address || feat.properties?.place_formatted || feat.properties?.name || '',
      });
    } catch {
      return NextResponse.json({ error: 'network' }, { status: 502 });
    }
  }

  // Default: suggest
  const q = (url.searchParams.get('q') || '').trim();
  if (q.length < 2) return NextResponse.json({ suggestions: [] });

  const lng = url.searchParams.get('lng');
  const lat = url.searchParams.get('lat');
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
