import { NextRequest, NextResponse } from 'next/server';
import { knownIssuesLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export const maxDuration = 15;

interface SpeedCamera {
  id: string;
  lat: number;
  lng: number;
  type: 'fixed' | 'red-light' | 'school-zone' | 'avg-speed' | 'mobile' | 'unknown';
  maxspeed?: string;
  source: 'osm';
}

/**
 * Speed camera lookup via OpenStreetMap Overpass API.
 *
 * Free, no API key, community-maintained. Germany (and Europe generally)
 * has dense camera coverage; US is patchy but improving. Falls back to
 * empty array on any failure — never blocks the driver experience.
 *
 * POST { bbox: [south, west, north, east] }
 *  → { cameras: SpeedCamera[], country?: string, suppressed?: boolean }
 *
 * In countries where real-time camera alerts are restricted (DE, FR, CH,
 * etc.) we still return the data but flag suppressed=true. The client
 * decides whether to render markers and adjusts the language to neutral
 * 'speed enforcement zone' instead of 'camera here'.
 */
const RESTRICTED_COUNTRIES = new Set(['DE', 'FR', 'CH', 'AT', 'BE', 'NL', 'LU', 'PT', 'SE', 'NO', 'FI', 'PL']);

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = knownIssuesLimiter.check(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  let body: { bbox?: [number, number, number, number] };
  try { body = await request.json(); }
  catch { return NextResponse.json({ cameras: [] }); }

  const bbox = body.bbox;
  if (!Array.isArray(bbox) || bbox.length !== 4) {
    return NextResponse.json({ cameras: [] });
  }
  const [south, west, north, east] = bbox;
  if ([south, west, north, east].some((n) => typeof n !== 'number')) {
    return NextResponse.json({ cameras: [] });
  }
  // Cap bbox size to ~150km diagonal so a country-spanning route doesn't
  // hammer Overpass; we re-fetch as the route updates anyway.
  const latSpan = Math.abs(north - south);
  const lngSpan = Math.abs(east - west);
  if (latSpan > 1.5 || lngSpan > 2.0) {
    return NextResponse.json({ cameras: [], reason: 'bbox_too_large' });
  }

  const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();
  const suppressed = RESTRICTED_COUNTRIES.has(country);

  // Overpass QL — speed_camera nodes plus enforcement nodes (red-light,
  // average-speed, etc.) within the bbox.
  const query = `[out:json][timeout:12];
(
  node["highway"="speed_camera"](${south},${west},${north},${east});
  node["enforcement"="maxspeed"](${south},${west},${north},${east});
  node["enforcement"="average_speed"](${south},${west},${north},${east});
  node["enforcement"="traffic_signals"](${south},${west},${north},${east});
);
out body 200;`;

  try {
    const r = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Overpass returns 406 to anonymous bursty traffic; include a UA so
        // the public instance can rate-limit per-app instead of blanket 406.
        'User-Agent': 'Au7o-Drive/1.0 (+https://au7o.io)',
        'Accept': 'application/json',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(13000),
    });
    if (!r.ok) {
      console.warn('[drive/cameras] Overpass HTTP', r.status);
      return NextResponse.json({ cameras: [], country, suppressed });
    }
    const data = await r.json();
    interface OverpassNode { id: number; lat: number; lon: number; tags?: Record<string, string> }
    const elements = (data.elements || []) as OverpassNode[];
    const cameras: SpeedCamera[] = [];
    for (const e of elements) {
      const tags = e.tags || {};
      let type: SpeedCamera['type'] = 'unknown';
      if (tags.enforcement === 'average_speed') type = 'avg-speed';
      else if (tags.enforcement === 'traffic_signals') type = 'red-light';
      else if (tags.enforcement === 'maxspeed' || tags.highway === 'speed_camera') type = 'fixed';
      if (tags.zone === 'school' || tags['school'] === 'yes') type = 'school-zone';
      cameras.push({
        id: `osm-${e.id}`,
        lat: e.lat,
        lng: e.lon,
        type,
        maxspeed: tags.maxspeed,
        source: 'osm',
      });
    }
    return NextResponse.json({ cameras, country, suppressed });
  } catch (err) {
    console.warn('[drive/cameras] error:', err);
    return NextResponse.json({ cameras: [], country, suppressed });
  }
}
