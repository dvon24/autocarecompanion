import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 30;

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface PlanRouteBody {
  transcript: string;
  origin?: { lng: number; lat: number };
}

/**
 * Voice-driven route planner.
 *   1) Claude parses the user's spoken text into a clean destination query + intent.
 *   2) Mapbox Geocoding turns the query into coordinates.
 *   3) Mapbox Directions returns the driving route from origin → destination.
 *   4) We return GeoJSON + a one-line summary the client can TTS back.
 */
export async function POST(request: NextRequest) {
  if (!ANTHROPIC_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 });
  }
  if (!MAPBOX_TOKEN) {
    return NextResponse.json({ error: 'MAPBOX_ACCESS_TOKEN not configured' }, { status: 503 });
  }

  let body: PlanRouteBody;
  try {
    body = (await request.json()) as PlanRouteBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const transcript = (body.transcript || '').trim();
  if (!transcript) return NextResponse.json({ error: 'transcript required' }, { status: 400 });
  if (!body.origin) return NextResponse.json({ error: 'origin (current location) required' }, { status: 400 });

  // 1. Parse spoken text into destination + intent
  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });
  const parsePrompt = `Extract the navigation destination from the user's spoken request. Return ONLY a JSON object:
{ "destination": "<clean geocodable place or address>", "intent": "navigate" }

Do not include directions or route preferences in the destination — just the place. If the user is unclear, return { "destination": "", "intent": "clarify" }.

User said: "${transcript}"`;

  let destination = '';
  try {
    const res = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: 'You parse voice navigation requests into clean destination strings. Return only JSON, no prose.',
      messages: [{ role: 'user', content: parsePrompt }],
    });
    const raw = res.content?.[0]?.type === 'text' ? res.content[0].text : '{}';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    destination = (parsed.destination || '').trim();
    if (!destination) {
      return NextResponse.json({ error: 'clarify', message: "I didn't catch a destination — try again." }, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'parse_failed', message: String(err) }, { status: 500 });
  }

  // 2. Geocode the destination near the user's current location
  const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${MAPBOX_TOKEN}&proximity=${body.origin.lng},${body.origin.lat}&limit=1`;
  const geoRes = await fetch(geocodeUrl);
  if (!geoRes.ok) {
    return NextResponse.json({ error: 'geocode_failed', message: `Mapbox geocode ${geoRes.status}` }, { status: 502 });
  }
  const geoData = await geoRes.json();
  const feature = geoData.features?.[0];
  if (!feature) {
    return NextResponse.json({ error: 'not_found', message: `Couldn't find "${destination}".` }, { status: 200 });
  }
  const [destLng, destLat] = feature.center as [number, number];
  const placeName = feature.place_name as string;

  // 3. Get driving directions from origin → destination
  const coords = `${body.origin.lng},${body.origin.lat};${destLng},${destLat}`;
  const dirUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&steps=false&access_token=${MAPBOX_TOKEN}`;
  const dirRes = await fetch(dirUrl);
  if (!dirRes.ok) {
    return NextResponse.json({ error: 'directions_failed', message: `Mapbox directions ${dirRes.status}` }, { status: 502 });
  }
  const dirData = await dirRes.json();
  const route = dirData.routes?.[0];
  if (!route) {
    return NextResponse.json({ error: 'no_route', message: `No driving route to ${placeName}.` }, { status: 200 });
  }

  const miles = (route.distance / 1609.34).toFixed(1);
  const minutes = Math.max(1, Math.round(route.duration / 60));
  const summary = `Route to ${placeName}. ${miles} miles, about ${minutes} minutes.`;

  return NextResponse.json({
    destination: placeName,
    origin: body.origin,
    destinationCoords: { lng: destLng, lat: destLat },
    geometry: route.geometry,
    miles: Number(miles),
    minutes,
    summary,
  });
}
