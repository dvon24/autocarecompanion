import { needsDealerReferral, type DealerReferralInput } from './known-issue-dealer-referral';

export type DealerSearchLocation = { lat: number; lng: number } | { place: string };
export type DealerSearchInput = { make: string; location: DealerSearchLocation };

export function parseDealerSearchInput(value: unknown): DealerSearchInput | null {
  if (!value || typeof value !== 'object') return null;
  const body = value as Record<string, unknown>;
  const make = typeof body.make === 'string' ? body.make.trim() : '';
  if (!make || make.length > 40 || /[\u0000-\u001f]/.test(make)) return null;
  if (body.place !== undefined) {
    if (body.lat !== undefined || body.lng !== undefined || typeof body.place !== 'string') return null;
    const place = body.place.trim();
    return place.length >= 2 && place.length <= 120 && !/[\u0000-\u001f]/.test(place) ? { make, location: { place } } : null;
  }
  const { lat, lng } = body;
  if (typeof lat !== 'number' || !Number.isFinite(lat) || lat < -90 || lat > 90
    || typeof lng !== 'number' || !Number.isFinite(lng) || lng < -180 || lng > 180) return null;
  return { make, location: { lat, lng } };
}

export function dealerSearchQuery(make: string, location?: DealerSearchLocation | null): string {
  const area = !location ? 'me' : 'place' in location ? location.place : `${location.lat},${location.lng}`;
  return `${make.trim()} dealership near ${area}`;
}

export function dealerMapsUrl(make: string, location?: DealerSearchLocation | null): string {
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: dealerSearchQuery(make, location) })}`;
}

// Only a separately configured browser Embed key belongs in an iframe. The
// server Places key must never be used here or returned by the dealer API.
export function dealerEmbedUrl(make: string, location: DealerSearchLocation | null, publicEmbedKey?: string): string | null {
  if (!location || !publicEmbedKey || !/^AIza[\w-]{35}$/.test(publicEmbedKey)) return null;
  const params = new URLSearchParams({ key: publicEmbedKey, q: dealerSearchQuery(make, location) });
  if ('lat' in location) {
    params.set('center', `${location.lat},${location.lng}`);
    params.set('zoom', '10');
  }
  return `https://www.google.com/maps/embed/v1/search?${params}`;
}

export function dealerPlacesRequest({ make, location }: DealerSearchInput) {
  return {
    textQuery: 'place' in location ? dealerSearchQuery(make, location) : `${make} dealership`,
    maxResultCount: 5,
    ...('lat' in location ? {
      rankPreference: 'DISTANCE',
      locationBias: { circle: { center: { latitude: location.lat, longitude: location.lng }, radius: 50_000 } },
    } : {}),
  };
}

export function dealerLocationFailure(code?: number): string {
  return code === 1
    ? 'Location was not shared. Enter a city or postcode, or open Google Maps.'
    : 'Your location is unavailable. Enter a city or postcode, or open Google Maps.';
}

export function twinIssueNeedsDealer(issue: DealerReferralInput & { recallFirst?: boolean; dealerRequired?: boolean }): boolean {
  return issue.recallFirst === true || issue.dealerRequired === true || needsDealerReferral(issue)
    || /\bdealer(?:ship)?[- ](?:required|only)\b|\brequires?\s+(?:a\s+)?dealer\b/i.test(issue.solution || '')
    // Passive repair instructions (the actual APIM wording) are not captured by
    // "visit your dealer". Require affirmative work, not any dealer mention.
    || (issue.solution || '').split(/[.!?;]/).some(sentence =>
      !/\b(?:not|never|no longer)\b/i.test(sentence)
      && /\b(?:is|are|must be|should be|can be)\s+(?:reprogrammed|programmed|repaired|replaced)(?:\s+or\s+(?:reprogrammed|programmed|repaired|replaced))?\s+by\s+(?:the|a|your|an authorized)\s+dealer\b/i.test(sentence));
}
