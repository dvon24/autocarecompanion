import { NextRequest, NextResponse } from 'next/server';
import { knownIssuesLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { dealerPlacesRequest, parseDealerSearchInput } from '@/lib/dealer-search';

export const runtime = 'nodejs';
export const maxDuration = 15;

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * POST /api/dealers/nearby — brand-specific dealer search near the owner, for known
 * issues whose fix is "see a dealer".
 *
 * Recall-first issues suppress every retail buy link on purpose: an open
 * manufacturer recall is repaired free, so sending an owner to buy the part is
 * actively harmful. That left those cards with no next step at all beyond a
 * generic NHTSA link. This is that next step.
 *
 * Deliberately scoped to the make on the issue — a Ford recall is repaired by a
 * Ford dealer, and a generic "car repair near me" result set would send owners
 * to shops that cannot perform warranty work.
 *
 * Degrades in three stages, so the feature is never a dead end:
 *   1. key set + owner shares location or enters an area → list, in page
 *   2. no key / no match          → `available:false`, client shows a Google
 *                                   Maps search link (no permission needed)
 *   3. owner denies geolocation   → client never calls this at all, same link
 */

interface Dealer {
  name: string;
  address: string | null;
  phone: string | null;
  mapsUrl: string | null;
  rating: number | null;
  ratingCount: number | null;
}

// Paid per field on the Places API, so this is the minimum that makes a useful
// card: who they are, where, how to call, how to navigate, and whether they are
// any good. No photos, no reviews, no opening hours.
const FIELD_MASK = [
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.googleMapsUri',
  'places.rating',
  'places.userRatingCount',
].join(',');

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = knownIssuesLimiter.check(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const input = parseDealerSearchInput(body);
  if (!input) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 });
  }
  if (!GOOGLE_KEY) {
    return NextResponse.json({ available: false, reason: 'not_configured', dealers: [] });
  }

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_KEY,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      // A brand-specific search is not verification of franchise status or
      // recall eligibility; owners still confirm both directly with the dealer.
      body: JSON.stringify(dealerPlacesRequest(input)),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.error('[dealers] places search failed', res.status);
      return NextResponse.json({ available: false, reason: 'upstream_error', dealers: [] });
    }

    const data = await res.json();
    const dealers: Dealer[] = (data?.places || []).slice(0, 5).map((p: Record<string, unknown>) => ({
      name: (p.displayName as { text?: string } | undefined)?.text || 'Dealer',
      address: (p.formattedAddress as string) || null,
      phone: (p.nationalPhoneNumber as string) || null,
      mapsUrl: (p.googleMapsUri as string) || null,
      rating: typeof p.rating === 'number' ? p.rating : null,
      ratingCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
    }));

    return NextResponse.json({ available: dealers.length > 0, dealers });
  } catch (err) {
    console.error('[dealers] lookup threw', err);
    return NextResponse.json({ available: false, reason: 'error', dealers: [] });
  }
}
