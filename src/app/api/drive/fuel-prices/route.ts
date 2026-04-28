import { NextRequest, NextResponse } from 'next/server';
import { knownIssuesLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export const maxDuration = 10;

/**
 * Gas station + fuel-price lookup for /drive.
 *
 * POST { lat: number, lng: number, radius?: number, country?: string }
 *  → { stations: FuelStation[], country: string, source: string | null }
 *
 * Country detection: explicit `country` field in body wins; falls back to
 * `x-vercel-ip-country`. The data source is country-keyed:
 *   DE → Tankerkönig (free for non-commercial; per-station live prices)
 *   else → empty (extension point — add CollectAPI, GasBuddy etc. later)
 *
 * Tankerkönig requires TANKERKOENIG_API_KEY in env. Without it we return
 * an empty response with source=null so the client UI can hide gracefully.
 */
interface FuelStation {
  id: string;
  name: string;
  brand: string | null;
  lat: number;
  lng: number;
  street?: string;
  city?: string;
  isOpen: boolean | null;
  prices: {
    e5: number | null;
    e10: number | null;
    diesel: number | null;
    currency: string;
    unit: string; // 'L' for liter, 'gal' for gallon
  };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = knownIssuesLimiter.check(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  let body: { lat?: unknown; lng?: unknown; radius?: unknown; country?: unknown };
  try { body = await request.json(); }
  catch { return NextResponse.json({ stations: [], country: '', source: null }); }

  const lat = typeof body.lat === 'number' ? body.lat : null;
  const lng = typeof body.lng === 'number' ? body.lng : null;
  if (lat == null || lng == null) {
    return NextResponse.json({ stations: [], country: '', source: null }, { status: 400 });
  }
  // Cap radius so an over-eager client can't pull half the country.
  const radiusKm = Math.min(typeof body.radius === 'number' ? body.radius : 10, 25);

  const explicitCountry = typeof body.country === 'string' ? body.country.toUpperCase() : '';
  const headerCountry = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();
  const country = explicitCountry || headerCountry || '';

  if (country === 'DE') {
    return await fetchTankerkoenig(lat, lng, radiusKm);
  }

  // No coverage in this country yet. Return an empty payload so the client
  // can decide whether to render markers without prices or hide them.
  return NextResponse.json({ stations: [], country, source: null });
}

interface TankerkoenigStation {
  id: string;
  name: string;
  brand: string;
  street: string;
  place: string;
  lat: number;
  lng: number;
  dist: number;
  diesel: number | null;
  e5: number | null;
  e10: number | null;
  isOpen: boolean;
}

async function fetchTankerkoenig(lat: number, lng: number, radiusKm: number) {
  const apiKey = process.env.TANKERKOENIG_API_KEY;
  if (!apiKey) {
    console.warn('[drive/fuel-prices] TANKERKOENIG_API_KEY not configured');
    return NextResponse.json({ stations: [], country: 'DE', source: null });
  }
  // Tankerkönig caps radius at 25 km hard.
  const rad = Math.min(Math.max(radiusKm, 1), 25);
  const url = `https://creativecommons.tankerkoenig.de/json/list.php?lat=${lat}&lng=${lng}&rad=${rad}&sort=dist&type=all&apikey=${apiKey}`;
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Au7o-Drive/1.0 (+https://au7o.io)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) {
      console.warn('[drive/fuel-prices] Tankerkönig HTTP', r.status);
      return NextResponse.json({ stations: [], country: 'DE', source: 'tankerkoenig' });
    }
    const data = await r.json();
    if (!data.ok || !Array.isArray(data.stations)) {
      return NextResponse.json({ stations: [], country: 'DE', source: 'tankerkoenig' });
    }
    const raw = data.stations as TankerkoenigStation[];
    // Tankerkönig returns prices as numbers in EUR/L. Skip stations with no
    // price data at all — they're noise on the map.
    const stations: FuelStation[] = raw
      .filter((s) => s.e5 || s.e10 || s.diesel)
      .slice(0, 30)
      .map((s) => ({
        id: `tk-${s.id}`,
        name: s.name,
        brand: s.brand || null,
        lat: s.lat,
        lng: s.lng,
        street: s.street,
        city: s.place,
        isOpen: s.isOpen ?? null,
        prices: {
          e5: s.e5 || null,
          e10: s.e10 || null,
          diesel: s.diesel || null,
          currency: 'EUR',
          unit: 'L',
        },
      }));
    return NextResponse.json({ stations, country: 'DE', source: 'tankerkoenig' });
  } catch (err) {
    console.warn('[drive/fuel-prices] Tankerkönig error:', err);
    return NextResponse.json({ stations: [], country: 'DE', source: 'tankerkoenig' });
  }
}
