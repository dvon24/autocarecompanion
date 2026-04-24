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
  "reply": "<short sentence spoken back to the driver, under 20 words>"
}

Rules:
- intent "navigate" — the user wants to go somewhere new or change the route. Fill "destination" with a clean geocodable string (place name, address, or "nearest X"). "reply" should be a short confirmation like "Routing to Whole Foods now."
- intent "clarify" — their ask is ambiguous (two Starbucks, they asked a vague "home", etc.). Leave destination empty. "reply" asks a short follow-up question.
- intent "chat" — they asked something that doesn't change the destination (e.g., "how long is this trip?", "any stops on the way?", "thanks"). Leave destination empty. "reply" is your spoken answer.
- If the user's last message builds on context ("the other one", "that Starbucks on Main"), use the conversation history to resolve it into a fresh destination string.
- Never invent traffic, ETAs, or distances beyond what the current route context already states.`;

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

  const miles = (route.distance / 1609.34).toFixed(1);
  const minutes = Math.max(1, Math.round(route.duration / 60));
  const summary = `Route to ${placeName}. ${miles} miles, about ${minutes} minutes.`;
  // Prefer Claude's conversational reply; fall back to the deterministic summary.
  const reply = spokenReply
    ? `${spokenReply} ${miles} miles, about ${minutes} minutes.`
    : summary;

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
  });
}
