import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 30;

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface PlanRouteBody {
  transcript: string;
  origin?: { lng: number; lat: number };
  conversationHistory?: ConversationTurn[];
  currentRoute?: { destination: string; miles: number; minutes: number } | null;
  fuelMilesRemaining?: number | null;
}

/**
 * Haversine distance in miles between two lng/lat points.
 */
function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Walk a route's coordinate array to find the lng/lat at N miles from start.
 */
function pointAtMilesAlongRoute(coords: number[][], milesFromStart: number): [number, number] | null {
  if (!Array.isArray(coords) || coords.length < 2) return null;
  let accumulated = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1];
    const [lng2, lat2] = coords[i];
    const segMiles = haversineMiles(lat1, lng1, lat2, lng2);
    if (accumulated + segMiles >= milesFromStart) {
      const t = segMiles === 0 ? 0 : (milesFromStart - accumulated) / segMiles;
      return [lng1 + (lng2 - lng1) * t, lat1 + (lat2 - lat1) * t];
    }
    accumulated += segMiles;
  }
  const last = coords[coords.length - 1];
  return [last[0], last[1]];
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

  // 1. Ask Claude to classify the voice turn. It may request navigation,
  //    ask for clarification, or just chat about the current route.
  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

  const currentRouteNote = body.currentRoute
    ? `The user is currently routed to "${body.currentRoute.destination}" (${body.currentRoute.miles} mi, ${body.currentRoute.minutes} min).`
    : 'The user has no active route yet.';

  const systemPrompt = `You are Au7o, a voice navigation copilot that runs in the car. Respond like a helpful, concise friend — never verbose.

${currentRouteNote}

Every turn, return ONLY a JSON object with this shape:
{
  "intent": "navigate" | "clarify" | "chat",
  "destination": "<clean geocodable place or address>",
  "fuelMilesRemaining": <number or null>,
  "reply": "<short sentence spoken back to the driver, under 20 words>"
}

Rules:
- intent "navigate" — the user wants to go somewhere new or change the route. Fill "destination" with a clean geocodable string (place name, address, or "nearest X"). "reply" should be a short confirmation like "Routing to Whole Foods now."
- intent "clarify" — their ask is ambiguous (two Starbucks, they asked a vague "home", etc.). Leave destination empty. "reply" asks a short follow-up question.
- intent "chat" — they asked something that doesn't change the destination (e.g., "how long is this trip?", "any stops on the way?", "thanks"). Leave destination empty. "reply" is your spoken answer.
- fuelMilesRemaining: if the user mentions how far they can go on fuel/charge ("I have 120 miles to empty", "80 miles of range left", "quarter tank"), extract a numeric estimate. A quarter tank ≈ 75 mi, half tank ≈ 150 mi, low/almost empty ≈ 30 mi. Otherwise null.
- If the user's last message builds on context ("the other one", "that Starbucks on Main"), use the conversation history to resolve it into a fresh destination string.
- Never invent traffic, ETAs, or distances beyond what the current route context already states. Never invent fuel range that wasn't asked about.`;

  const messages: { role: 'user' | 'assistant'; content: string }[] = [];
  if (Array.isArray(body.conversationHistory)) {
    for (const t of body.conversationHistory.slice(-10)) {
      if (t.role === 'user' || t.role === 'assistant') {
        messages.push({ role: t.role, content: String(t.content || '') });
      }
    }
  }
  messages.push({ role: 'user', content: transcript });

  let intent: 'navigate' | 'clarify' | 'chat' = 'navigate';
  let destination = '';
  let spokenReply = '';
  // Priority for fuel range: explicit body param > value Claude extracted from the utterance.
  let fuelMilesRemaining: number | null = typeof body.fuelMilesRemaining === 'number' ? body.fuelMilesRemaining : null;
  try {
    const res = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: systemPrompt,
      messages,
    });
    const raw = res.content?.[0]?.type === 'text' ? res.content[0].text : '{}';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    intent = parsed.intent === 'clarify' || parsed.intent === 'chat' ? parsed.intent : 'navigate';
    destination = (parsed.destination || '').trim();
    spokenReply = (parsed.reply || '').trim();
    if (fuelMilesRemaining == null && typeof parsed.fuelMilesRemaining === 'number') {
      fuelMilesRemaining = parsed.fuelMilesRemaining;
    }
  } catch (err) {
    return NextResponse.json({ error: 'parse_failed', message: String(err) }, { status: 500 });
  }

  // If Claude only wanted to clarify or chat, return without geocoding.
  if (intent !== 'navigate' || !destination) {
    return NextResponse.json({
      intent,
      reply: spokenReply || "I'm not sure I got that — can you say it again?",
    });
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

  const milesNum = route.distance / 1609.34;
  const miles = milesNum.toFixed(1);
  const minutes = Math.max(1, Math.round(route.duration / 60));
  const summary = `Route to ${placeName}. ${miles} miles, about ${minutes} minutes.`;

  // Fuel-stop planning: if the user mentioned a remaining range and the trip exceeds it,
  // pick a point along the route at ~70% of their range (30% safety buffer) and look up
  // the nearest gas station via Mapbox Geocoding.
  interface FuelStop { name: string; lng: number; lat: number; milesFromStart: number }
  let fuelStops: FuelStop[] = [];
  let fuelWarning = '';
  if (fuelMilesRemaining != null && fuelMilesRemaining > 0 && milesNum > fuelMilesRemaining) {
    const targetMiles = Math.max(5, Math.min(fuelMilesRemaining * 0.7, milesNum - 2));
    const point = pointAtMilesAlongRoute(route.geometry.coordinates as number[][], targetMiles);
    if (point) {
      try {
        const gasUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent('gas station')}.json?proximity=${point[0]},${point[1]}&limit=1&access_token=${MAPBOX_TOKEN}`;
        const gasRes = await fetch(gasUrl);
        if (gasRes.ok) {
          const gasData = await gasRes.json();
          const gasFeature = gasData.features?.[0];
          if (gasFeature) {
            const [gLng, gLat] = gasFeature.center as [number, number];
            fuelStops.push({
              name: gasFeature.text || 'Gas station',
              lng: gLng,
              lat: gLat,
              milesFromStart: Math.round(targetMiles),
            });
            fuelWarning = `You'll need gas — I marked ${gasFeature.text || 'a station'} about ${Math.round(targetMiles)} miles in.`;
          }
        }
      } catch { /* non-blocking */ }
    }
    if (!fuelStops.length) {
      fuelWarning = `Heads up — trip is ${miles} miles but you only have about ${Math.round(fuelMilesRemaining)} miles of range.`;
    }
  }

  // Prefer Claude's conversational reply; fall back to the deterministic summary.
  const baseReply = spokenReply
    ? `${spokenReply} ${miles} miles, about ${minutes} minutes.`
    : summary;
  const reply = fuelWarning ? `${baseReply} ${fuelWarning}` : baseReply;

  return NextResponse.json({
    intent: 'navigate',
    destination: placeName,
    origin: body.origin,
    destinationCoords: { lng: destLng, lat: destLat },
    geometry: route.geometry,
    miles: Number(miles),
    minutes,
    summary,
    reply,
    fuelStops,
    fuelMilesRemaining,
  });
}
