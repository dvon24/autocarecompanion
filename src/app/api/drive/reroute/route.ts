import { NextRequest, NextResponse } from 'next/server';
import {
  driveTurnMinuteLimiter,
  getClientIp,
} from '@/lib/rate-limit';

export const maxDuration = 15;

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface NavStep {
  instruction: string;
  distance: number;
  duration: number;
  location: [number, number];
  voice?: Array<{ distanceAlongGeometry: number; announcement: string }>;
}

/**
 * Lightweight reroute endpoint — recomputes the Mapbox driving-traffic route
 * from the user's current GPS to their original destination with the same
 * route preferences. NO Claude, NO geocoding. Used for:
 *
 *   - Auto-reroute when the driver leaves the planned route
 *   - Periodic re-fetch (every 2-3 min) to update ETA with live traffic
 *
 * Cheap and fast: a single Mapbox Directions call per invocation.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = driveTurnMinuteLimiter.check(ip);
  if (!limit.success) {
    return NextResponse.json({ error: 'rate_limited', retryAfter: limit.reset }, { status: 429 });
  }

  if (!MAPBOX_TOKEN) {
    return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
  }

  let body: {
    origin?: { lng: number; lat: number };
    destination?: { lng: number; lat: number };
    isRoundTrip?: boolean;
    routePreferences?: { avoidHighways?: boolean; avoidTolls?: boolean; avoidFerries?: boolean };
  };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }); }

  const o = body.origin;
  const d = body.destination;
  if (!o || !d || typeof o.lng !== 'number' || typeof d.lng !== 'number') {
    return NextResponse.json({ error: 'missing_coords' }, { status: 400 });
  }

  const coords = body.isRoundTrip
    ? `${o.lng},${o.lat};${d.lng},${d.lat};${o.lng},${o.lat}`
    : `${o.lng},${o.lat};${d.lng},${d.lat}`;

  const excludeList: string[] = [];
  if (body.routePreferences?.avoidHighways) excludeList.push('motorway');
  if (body.routePreferences?.avoidTolls) excludeList.push('toll');
  if (body.routePreferences?.avoidFerries) excludeList.push('ferry');
  const excludeParam = excludeList.length > 0 ? `&exclude=${excludeList.join(',')}` : '';

  // alternatives=true returns up to 3 route options sharing the same OD pair.
  // Mapbox already factors live traffic per option, so the alternate's
  // duration is the apples-to-apples comparison we surface as "faster route".
  const dirUrl = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coords}?geometries=geojson&overview=full&steps=true&annotations=maxspeed&voice_instructions=true&voice_units=imperial&banner_instructions=true&language=en&alternatives=true${excludeParam}&access_token=${MAPBOX_TOKEN}`;

  try {
    const r = await fetch(dirUrl);
    if (!r.ok) {
      console.error('[drive/reroute] Mapbox directions', r.status);
      return NextResponse.json({ error: 'directions_failed' }, { status: 502 });
    }
    const data = await r.json();
    const route = data.routes?.[0];
    if (!route) return NextResponse.json({ error: 'no_route' }, { status: 200 });

    interface MaxSpeedEntry { speed: number | null; unit: 'mph' | 'km/h' | null; unknown?: boolean; none?: boolean }
    const speedLimits: MaxSpeedEntry[] = [];
    const steps: NavStep[] = [];
    if (Array.isArray(route.legs)) {
      for (const leg of route.legs) {
        const arr = leg?.annotation?.maxspeed;
        if (Array.isArray(arr)) {
          for (const m of arr) {
            if (m?.none) speedLimits.push({ speed: null, unit: null, none: true });
            else if (m?.unknown) speedLimits.push({ speed: null, unit: null, unknown: true });
            else if (typeof m?.speed === 'number') {
              speedLimits.push({ speed: m.speed, unit: m.unit === 'km/h' ? 'km/h' : 'mph' });
            } else {
              speedLimits.push({ speed: null, unit: null, unknown: true });
            }
          }
        }
        for (const s of (leg.steps || [])) {
          steps.push({
            instruction: s.maneuver?.instruction || '',
            distance: s.distance || 0,
            duration: s.duration || 0,
            location: s.maneuver?.location || [0, 0],
            voice: (s.voiceInstructions || []).map((v: { distanceAlongGeometry: number; announcement: string }) => ({
              distanceAlongGeometry: v.distanceAlongGeometry,
              announcement: v.announcement,
            })),
          });
        }
      }
    }

    const milesNum = route.distance / 1609.34;

    // Alternates: any sibling route options Mapbox returned. We send the
    // client a slim summary (geometry + duration + distance + a road-class
    // hint) so it can compare and offer 'faster route via X' if applicable.
    interface AltSummary {
      geometry: GeoJSON.LineString;
      miles: number;
      minutes: number;
      summary: string;
      steps: NavStep[];
    }
    const alternates: AltSummary[] = [];
    if (Array.isArray(data.routes) && data.routes.length > 1) {
      for (let i = 1; i < data.routes.length; i++) {
        const alt = data.routes[i];
        if (!alt?.geometry || typeof alt.distance !== 'number') continue;
        // Mapbox Directions includes a 'weight_name' + per-leg 'summary'
        // text like 'A8, B312' which is plenty descriptive for a one-line
        // switch prompt.
        const summary = (alt.legs || []).map((l: { summary?: string }) => l.summary || '').filter(Boolean).join(' / ').slice(0, 80) || 'alternate route';
        const altSteps: NavStep[] = [];
        if (Array.isArray(alt.legs)) {
          for (const leg of alt.legs) {
            for (const s of (leg.steps || [])) {
              altSteps.push({
                instruction: s.maneuver?.instruction || '',
                distance: s.distance || 0,
                duration: s.duration || 0,
                location: s.maneuver?.location || [0, 0],
                voice: (s.voiceInstructions || []).map((v: { distanceAlongGeometry: number; announcement: string }) => ({
                  distanceAlongGeometry: v.distanceAlongGeometry,
                  announcement: v.announcement,
                })),
              });
            }
          }
        }
        alternates.push({
          geometry: alt.geometry,
          miles: Number((alt.distance / 1609.34).toFixed(1)),
          minutes: Math.max(1, Math.round(alt.duration / 60)),
          summary,
          steps: altSteps,
        });
      }
    }

    return NextResponse.json({
      geometry: route.geometry,
      miles: Number(milesNum.toFixed(1)),
      minutes: Math.max(1, Math.round(route.duration / 60)),
      speedLimits,
      steps,
      alternates,
    });
  } catch (err) {
    console.error('[drive/reroute] error:', err);
    return NextResponse.json({ error: 'reroute_failed' }, { status: 502 });
  }
}
