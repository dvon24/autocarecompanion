import { NextRequest, NextResponse } from 'next/server';
import { knownIssuesLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export const maxDuration = 15;

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * Rich POI details via Google Places API (New v1).
 *
 * Flow: textSearch with location bias → top result includes most fields
 * directly thanks to the field mask, no separate Place Details call needed.
 *
 * Returns null fields when GOOGLE_PLACES_API_KEY is missing OR Google has
 * no match — client falls back to the AI-generated brief from
 * /api/drive/poi-details.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = knownIssuesLimiter.check(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  if (!GOOGLE_KEY) {
    return NextResponse.json({ source: 'google', available: false, reason: 'not_configured' });
  }

  let body: { name?: string; lng?: number; lat?: number; language?: 'en' | 'de' };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }); }

  const name = (body.name || '').trim();
  if (!name || typeof body.lng !== 'number' || typeof body.lat !== 'number') {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 });
  }

  // Pick which fields to ask for — paid per field, so be deliberate.
  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.rating',
    'places.userRatingCount',
    'places.priceLevel',
    'places.websiteUri',
    'places.nationalPhoneNumber',
    'places.regularOpeningHours',
    'places.currentOpeningHours',
    'places.editorialSummary',
    'places.primaryType',
    'places.primaryTypeDisplayName',
    'places.types',
    'places.googleMapsUri',
    'places.reviews',
    'places.photos',
  ].join(',');

  const lang = body.language === 'de' ? 'de' : 'en';

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_KEY,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify({
        textQuery: name,
        languageCode: lang,
        maxResultCount: 1,
        locationBias: {
          circle: {
            center: { latitude: body.lat, longitude: body.lng },
            radius: 500, // meters — POI tap was on this exact spot
          },
        },
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.warn('[poi-rich-details] Google HTTP', res.status, txt.slice(0, 200));
      return NextResponse.json({ source: 'google', available: false, reason: `http_${res.status}` });
    }
    const data = await res.json();
    const place = (data.places || [])[0];
    if (!place) {
      return NextResponse.json({ source: 'google', available: true, found: false });
    }

    // Curate the response down to what the popup actually renders.
    interface Review { authorAttribution?: { displayName?: string }; rating?: number; relativePublishTimeDescription?: string; text?: { text?: string } }
    const reviews = (place.reviews || []).slice(0, 3).map((r: Review) => ({
      author: r.authorAttribution?.displayName || '',
      rating: r.rating || null,
      relativeTime: r.relativePublishTimeDescription || '',
      text: (r.text?.text || '').slice(0, 280),
    }));

    // Photo references — Google returns `name` strings like "places/X/photos/Y"
    // that the client uses to fetch via /api/drive/poi-photo (the actual key
    // never leaves the server). Cap at 4 so we don't pay for more than we render.
    interface Photo { name?: string; widthPx?: number; heightPx?: number }
    const photoNames = (place.photos || [])
      .slice(0, 4)
      .map((p: Photo) => p.name)
      .filter((n: unknown): n is string => typeof n === 'string' && n.startsWith('places/'));

    // Humanized cuisine/type — primaryTypeDisplayName is already localized
    // to the requested language. Falls back to a tidied primaryType when
    // the new field is missing on older records.
    const typeLabel = place.primaryTypeDisplayName?.text
      || (place.primaryType ? place.primaryType.replace(/_/g, ' ') : '');

    return NextResponse.json({
      source: 'google',
      available: true,
      found: true,
      name: place.displayName?.text || name,
      address: place.formattedAddress || '',
      rating: typeof place.rating === 'number' ? place.rating : null,
      ratingCount: typeof place.userRatingCount === 'number' ? place.userRatingCount : null,
      priceLevel: place.priceLevel || null,
      phone: place.nationalPhoneNumber || '',
      website: place.websiteUri || '',
      googleMapsUri: place.googleMapsUri || '',
      openNow: place.currentOpeningHours?.openNow ?? null,
      todaysHours: (place.currentOpeningHours?.weekdayDescriptions || [])[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] || '',
      weeklyHours: place.regularOpeningHours?.weekdayDescriptions || [],
      summary: place.editorialSummary?.text || '',
      primaryType: place.primaryType || '',
      typeLabel,
      reviews,
      photoNames,
    });
  } catch (err) {
    console.error('[poi-rich-details] error:', err);
    return NextResponse.json({ source: 'google', available: false, reason: 'network' });
  }
}
