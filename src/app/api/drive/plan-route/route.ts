import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  driveTurnMinuteLimiter,
  driveTurnDayLimiter,
  getClientIp,
} from '@/lib/rate-limit';

function formatRetryAfter(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

export const maxDuration = 30;

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface DriveVehicle {
  year: number;
  make: string;
  model: string;
  trim: string;
}

interface RouteHistoryEntry {
  destination: string;
  miles: number;
  minutes: number;
  at: number;
}

interface PlanRouteBody {
  transcript: string;
  origin?: { lng: number; lat: number };
  conversationHistory?: ConversationTurn[];
  currentRoute?: { destination: string; miles: number; minutes: number; destinationCoords?: { lng: number; lat: number } } | null;
  fuelMilesRemaining?: number | null;
  vehicle?: DriveVehicle | null;
  driverPreferences?: string | null;
  routeHistory?: RouteHistoryEntry[];
  /**
   * If the user picked an autocomplete suggestion, the client passes the
   * SearchBox-retrieved coordinates here so we skip the ambiguous geocoding
   * step entirely. Used to fix 'Öhringen' fuzzy-matching to 'Böhringen'.
   */
  trustedDestination?: { lng: number; lat: number; placeName: string } | null;
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
  // Rate limit — each voice turn fans out to Claude + Mapbox geocoding + directions
  // + (sometimes) a gas-station lookup, so we cap both per-minute burst and daily volume.
  // We return a friendly spoken-style message instead of a bare 429 so the driver gets
  // a useful TTS warning mid-drive.
  const ip = getClientIp(request);
  const dayCheck = driveTurnDayLimiter.check(ip);
  if (!dayCheck.success) {
    const wait = formatRetryAfter(dayCheck.reset);
    return NextResponse.json(
      {
        error: 'rate_limit_day',
        message: `You've hit today's voice limit during the beta. Try again in ${wait}, or sign up for the subscription for unlimited use.`,
      },
      { status: 429, headers: { 'Retry-After': String(dayCheck.reset) } },
    );
  }
  const minCheck = driveTurnMinuteLimiter.check(ip);
  if (!minCheck.success) {
    const wait = formatRetryAfter(minCheck.reset);
    return NextResponse.json(
      {
        error: 'rate_limit_minute',
        message: `Slow down — too many voice commands in a row. Try again in ${wait}.`,
      },
      { status: 429, headers: { 'Retry-After': String(minCheck.reset) } },
    );
  }

  if (!ANTHROPIC_KEY) {
    console.error('[drive/plan-route] ANTHROPIC_API_KEY missing in env');
    return NextResponse.json(
      { error: 'service_unavailable', message: 'Voice features are temporarily offline. Please try again later.' },
      { status: 503 },
    );
  }
  if (!MAPBOX_TOKEN) {
    console.error('[drive/plan-route] MAPBOX_ACCESS_TOKEN missing in env');
    return NextResponse.json(
      { error: 'service_unavailable', message: 'Maps are temporarily offline. Please try again later.' },
      { status: 503 },
    );
  }

  let body: PlanRouteBody;
  try {
    body = (await request.json()) as PlanRouteBody;
  } catch {
    return NextResponse.json(
      { error: 'bad_request', message: "I couldn't read that request. Try again." },
      { status: 400 },
    );
  }

  const transcript = (body.transcript || '').trim();
  if (!transcript) {
    return NextResponse.json(
      { error: 'no_transcript', message: "I didn't hear anything — try again." },
      { status: 400 },
    );
  }
  if (!body.origin) {
    return NextResponse.json(
      { error: 'no_location', message: 'I need your location to plan a route. Please enable location access.' },
      { status: 400 },
    );
  }

  // 1. Ask Claude to classify the voice turn. It may request navigation,
  //    ask for clarification, or just chat about the current route.
  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

  const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();

  // Reverse-geocode the driver's coordinates to a real city/region/country string.
  // This gives Claude concrete location context ("Stuttgart, Baden-Württemberg, Germany")
  // instead of just lat/lng — critical for disambiguating "Munich", "Kelley Barracks", etc.
  let driverPlace = '';
  try {
    const revUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${body.origin.lng},${body.origin.lat}.json?types=place,locality,region,country&limit=1&language=en&access_token=${MAPBOX_TOKEN}`;
    const revRes = await fetch(revUrl);
    if (revRes.ok) {
      const revData = await revRes.json();
      driverPlace = revData.features?.[0]?.place_name || '';
    }
  } catch { /* non-blocking */ }

  const currentRouteNote = body.currentRoute
    ? `The user is currently routed to "${body.currentRoute.destination}" (${body.currentRoute.miles} mi, ${body.currentRoute.minutes} min).`
    : 'The user has no active route yet.';

  const locationNote = `LOCATION: The driver is currently in ${driverPlace || `approximately ${body.origin.lat.toFixed(4)}, ${body.origin.lng.toFixed(4)}${country ? ` (country code ${country})` : ''}`}. Use this as the implicit context for every destination they mention — when they say "Munich" they almost certainly mean the famous city in Germany if they're already in Germany; when they say "Kelley Barracks" they mean the US Army installation in Stuttgart if they're near Stuttgart; when they say "Covino" they mean the local restaurant by that name in their city. Apply common sense the way a local friend would.`;

  // Look up structured fuel economy + tank data for the selected vehicle so
  // Claude can quote real numbers instead of estimating from memory.
  let fuelLine = '';
  if (body.vehicle) {
    try {
      const { getVehicleSpecs } = await import('@/lib/maintenance');
      const specs = getVehicleSpecs({ year: body.vehicle.year, make: body.vehicle.make, model: body.vehicle.model, trim: body.vehicle.trim });
      const fe = specs?.fuelEconomy;
      const tc = specs?.tankCapacity;
      if (fe || tc) {
        const parts: string[] = [];
        if (fe?.combined) parts.push(`${fe.combined} mpg combined`);
        if (fe?.city && fe?.highway) parts.push(`${fe.city} city / ${fe.highway} hwy`);
        if (fe?.mpgeCombined) parts.push(`${fe.mpgeCombined} MPGe`);
        if (tc?.gallons) parts.push(`${tc.gallons} gal tank`);
        if (tc?.batteryKwh) parts.push(`${tc.batteryKwh} kWh battery`);
        if (parts.length > 0 && fe?.combined && tc?.gallons) {
          parts.push(`≈ ${Math.round(fe.combined * tc.gallons)} mi full-tank range`);
        }
        if (parts.length > 0) fuelLine = ` Verified specs: ${parts.join(' · ')}.`;
      }
    } catch { /* non-blocking */ }
  }

  const vehicleNote = body.vehicle
    ? `VEHICLE: The driver is in a ${body.vehicle.year} ${body.vehicle.make} ${body.vehicle.model} ${body.vehicle.trim}.${fuelLine} Use these verified numbers when reasoning about range, fuel stops, or how the car performs on different roads.`
    : 'VEHICLE: Unknown — the driver has not picked a vehicle yet. If they ask about range, mention you can give better answers once they pick a vehicle.';

  const prefsNote = body.driverPreferences
    ? `DRIVER PREFERENCES (learned from past sessions, may be empty):\n${body.driverPreferences.slice(-1500)}`
    : '';

  const historyNote = body.routeHistory && body.routeHistory.length > 0
    ? `RECENT ROUTES THE DRIVER HAS TAKEN (most recent last):\n${body.routeHistory.slice(-10).map(r => `- ${r.destination} (${r.miles} mi)`).join('\n')}\nUse this to avoid suggesting the exact same "nice drive" twice in a row.`
    : '';

  const systemPrompt = `You are Au7o, a voice navigation copilot that runs in the car. Respond like a helpful, concise friend — never verbose.

${locationNote}

${currentRouteNote}

${vehicleNote}

${prefsNote}

${historyNote}

Every turn, return ONLY a JSON object with this shape:
{
  "intent": "navigate" | "clarify" | "chat",
  "destination": "<clean geocodable place or address>",
  "keepDestination": <boolean>,
  "isRoundTrip": <boolean>,
  "routePreferences": {
    "avoidHighways": <boolean>,
    "avoidTolls": <boolean>,
    "avoidFerries": <boolean>
  },
  "fuelMilesRemaining": <number or null>,
  "needsParkingSearch": <boolean>,
  "tripIntelligence": {
    "tripType": "commute" | "errand" | "road_trip" | "scenic" | "unknown",
    "suggestions": ["<short suggestion 1>", "<short suggestion 2>"],
    "delayWarning": "<short warning about expected traffic / timing or empty string>",
    "breakRecommendation": "<short recommendation for breaks / fuel / food on long trips or empty string>"
  },
  "preferenceUpdate": "<short single-line note to remember for future sessions, or empty string>",
  "reply": "<short sentence spoken back to the driver, under 20 words>"
}

Rules:
- keepDestination: TRUE when the user is modifying routing preferences for the SAME current destination (e.g., 'I want highways instead', 'no tolls', 'go faster', 'take the scenic route', 'reroute', 'use back roads instead'). When TRUE, set intent='navigate' and copy the destination text from the current route — the system will reuse the existing destination coordinates instead of re-geocoding (avoids fuzzy-match errors). FALSE when the user picks a NEW destination.
- intent "navigate" — the user wants to go somewhere new or change the route. Fill "destination" with a geocodable string. STRICT RULES for the destination string:
  • NEVER invent or guess street names or numbers. A wrong street is far worse than no street.
  • If you know the verified street address from your training or from a web_search result, use it: "Kelley Barracks, Plieninger Straße 100, 70567 Stuttgart, Germany"
  • If you do NOT know the exact street address, omit the street entirely and use only "<Place name>, <City>, <Country>" — Mapbox can usually still find it.
  • For non-chain places (military bases, local restaurants, small businesses, landmarks) you should ALWAYS call the web_search tool first to verify the real address before responding. Search for the place name plus the driver's city.
  • For chain stores, well-known landmarks, or "nearest X" patterns, no web_search needed.
  • Always include city and country when you know them.
  Examples:
  - "Munich" (driver in Germany) → "Munich, Germany" ✓
  - "Kelley Barracks" (driver near Stuttgart, you've verified address) → "Kelley Barracks, Plieninger Straße 100, 70567 Stuttgart, Germany" ✓
  - "Kelley Barracks" (you're not sure of street) → "Kelley Barracks, Stuttgart, Germany" ✓ (NOT "Kelley Barracks, MadeUpStraße 1, ...")
  - "Covino" (verified via web_search) → "Covino, <real verified street>, Stuttgart, Germany" ✓
  - "Covino" (web_search didn't help) → "Covino restaurant, Stuttgart, Germany" ✓
"reply" should be a short confirmation like "Routing to Whole Foods now."
- intent "clarify" — their ask is ambiguous (two Starbucks, they asked a vague "home", etc.). Leave destination empty. "reply" asks a short follow-up question.
- intent "chat" — they asked something that doesn't change the destination (e.g., "how long is this trip?", "any stops on the way?", "thanks"). Leave destination empty. "reply" is your spoken answer.
- "NICE DRIVE" intent — if the user says things like "take me on a nice drive", "find me a scenic route", "I just want to cruise", "somewhere fun", pick a real geographic destination about 30–80 miles away from their current location that would make a pleasant out-and-back or loop drive — prefer scenic roads, coastlines, mountain passes, state parks, or historic towns when plausible for their region. DON'T pick interstate stretches or strip malls. Set intent = "navigate" with that destination. Use the DRIVER PREFERENCES and RECENT ROUTES context to pick somewhere new and aligned to their taste. In "reply", name the destination + why it'll be nice ("How about Chuckanut Drive? Great coastal cruise, 45 miles round trip."). If the driver has already asked for a nice drive recently, offer a different one.
- fuelMilesRemaining: if the user mentions how far they can go on fuel/charge ("I have 120 miles to empty", "80 miles of range left", "quarter tank"), extract a numeric estimate. A quarter tank ≈ 75 mi, half tank ≈ 150 mi, low/almost empty ≈ 30 mi. If they say "I just filled up" and a vehicle is known, estimate full tank × combined MPG. Otherwise null.
- preferenceUpdate: if the user states a durable preference we should remember next time ("I hate highways", "I like curvy mountain roads", "always avoid tolls", "no left turns on unprotected lights"), write a one-line note like "Prefers curvy mountain roads, dislikes highways." Otherwise empty string. Do NOT echo routine navigation commands as preferences.
- isRoundTrip: TRUE when the user wants to come back to their starting point — phrases like "round trip", "and back", "back home", "loop", "return trip", "there and back", or "nice drive" / "scenic drive" with no specific destination they want to end at. Otherwise FALSE.
- routePreferences: extract ONLY from the user's CURRENT message. **Do NOT** read these from stored DRIVER PREFERENCES — preferences are advisory background, not per-trip routing rules. Each trip starts clean unless the user re-asks this turn.
  - avoidHighways: TRUE ONLY when the CURRENT message contains EXPLICIT highway-avoidance language — "no highways", "avoid highways", "no motorways", "no autobahn", "back roads only", "back roads instead", "no interstates". **Default FALSE.** Saying "scenic drive", "nice drive", "take me somewhere fun", "long drive", or anything aesthetic does NOT make this TRUE.
  - avoidTolls: TRUE ONLY when the CURRENT message says "no tolls", "avoid tolls", "don't take the tollway". Default FALSE.
  - avoidFerries: TRUE ONLY when the CURRENT message says "no ferries". Default FALSE.
  - When in doubt, return FALSE. The driver can always re-route if they want to avoid something.
- needsParkingSearch: set TRUE when the destination is the kind of place that probably doesn't have its own easy parking — restaurants in downtown/urban areas, bars, clubs, theaters, museums, sports venues, cafes in dense neighborhoods, concert halls. Set FALSE for destinations that clearly include ample parking — big-box stores (Walmart, Target, Costco), suburban strip malls, malls, airports, IKEA, most gas stations. When uncertain, prefer TRUE for small/urban places and FALSE for large/suburban.
- tripIntelligence: be the driver's eyes-forward. Reason about the trip and add useful context:
  - tripType: "commute" if it matches a familiar route at typical commute hours; "errand" for short utility trips (<30 min); "road_trip" for 2+ hour drives; "scenic" if the user said "nice drive" or asked for a leisurely route; "unknown" otherwise.
  - suggestions: 0–3 short actionable hints. Empty array if you have nothing genuinely useful.
  - delayWarning: short warning ONLY if the time of day or day of week typically causes delays on this route. Empty string otherwise.
  - breakRecommendation: ONLY for trips longer than 2 hours. Suggest a midpoint stop with rough timing. Empty string for shorter trips.
  - **CRITICAL: do NOT invent specific waypoint town names, exits, rest-stop names, or 'we'll go through X' descriptions.** Mapbox computes the actual route AFTER you respond, and your guess about which towns it will pass through will usually be wrong. Stick to general descriptions ("a scenic backroads route", "rural country roads") and only mention SPECIFIC places if they're the destination itself or come from a known interest in the driver's preferences.
  - Use DRIVER PREFERENCES to flag mismatches.
  - Use VEHICLE info to call out range issues you didn't already cover in fuelStops.
  - Be honest about uncertainty. Don't fabricate live traffic, specific exits, or town-by-town narration — speak in averages and patterns from your training, never invent the route Mapbox is about to draw.
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
  let preferenceUpdate = '';
  let needsParkingSearch = false;
  let isRoundTrip = false;
  let keepDestination = false;
  const routePreferences = { avoidHighways: false, avoidTolls: false, avoidFerries: false };
  interface TripIntelligence {
    tripType: 'commute' | 'errand' | 'road_trip' | 'scenic' | 'unknown';
    suggestions: string[];
    delayWarning: string;
    breakRecommendation: string;
  }
  let tripIntelligence: TripIntelligence | null = null;
  // Priority for fuel range: explicit body param > value Claude extracted from the utterance.
  let fuelMilesRemaining: number | null = typeof body.fuelMilesRemaining === 'number' ? body.fuelMilesRemaining : null;
  try {
    const res = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages,
      // Server-side web search — Anthropic handles the search internally and
      // returns results in the same response. Capped to keep latency reasonable.
      tools: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { type: 'web_search_20250305', name: 'web_search', max_uses: 3 } as any,
      ],
    });
    // Log content-block kinds so we can confirm in Vercel logs whether web_search fired.
    const blockKinds = (res.content || []).map((b: { type: string }) => b.type).join(',');
    const usedWebSearch = blockKinds.includes('web_search_tool_use') || blockKinds.includes('server_tool_use');
    console.log(`[drive/plan-route] Claude blocks: ${blockKinds} | web_search used: ${usedWebSearch}`);
    // Final answer comes in the LAST text block (after any tool_use / tool_result blocks).
    const textBlocks = (res.content || []).filter((b: { type: string }) => b.type === 'text') as Array<{ type: 'text'; text: string }>;
    const raw = textBlocks.length > 0 ? textBlocks[textBlocks.length - 1].text : '{}';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    // Try to extract a JSON object from the response even if Claude wrapped it
    // in conversational prose. Falls back to treating the whole text as a
    // chat-mode reply rather than crashing the route.
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch { /* fall through */ }
      }
    }
    if (parsed && typeof parsed === 'object') {
      intent = parsed.intent === 'clarify' || parsed.intent === 'chat' ? parsed.intent : 'navigate';
      destination = String(parsed.destination || '').trim();
      spokenReply = String(parsed.reply || '').trim();
      preferenceUpdate = String(parsed.preferenceUpdate || '').trim();
      needsParkingSearch = parsed.needsParkingSearch === true;
      isRoundTrip = parsed.isRoundTrip === true;
      keepDestination = parsed.keepDestination === true;
      const rp = parsed.routePreferences as { avoidHighways?: unknown; avoidTolls?: unknown; avoidFerries?: unknown } | undefined;
      if (rp && typeof rp === 'object') {
        routePreferences.avoidHighways = rp.avoidHighways === true;
        routePreferences.avoidTolls = rp.avoidTolls === true;
        routePreferences.avoidFerries = rp.avoidFerries === true;
      }
      if (fuelMilesRemaining == null && typeof parsed.fuelMilesRemaining === 'number') {
        fuelMilesRemaining = parsed.fuelMilesRemaining;
      }
      const ti = parsed.tripIntelligence as Partial<TripIntelligence> | undefined;
      if (ti && typeof ti === 'object') {
        const tType = ti.tripType;
        tripIntelligence = {
          tripType: (tType === 'commute' || tType === 'errand' || tType === 'road_trip' || tType === 'scenic')
            ? tType
            : 'unknown',
          suggestions: Array.isArray(ti.suggestions) ? ti.suggestions.filter((s) => typeof s === 'string').slice(0, 3) : [],
          delayWarning: String(ti.delayWarning || '').trim(),
          breakRecommendation: String(ti.breakRecommendation || '').trim(),
        };
      }
    } else {
      // Claude broke contract and returned plain text. Don't crash — just
      // treat it as a conversational reply to the driver.
      console.warn('[drive/plan-route] Non-JSON Claude response, treating as chat reply:', cleaned.slice(0, 200));
      intent = 'chat';
      spokenReply = cleaned.slice(0, 280) || "I'm not sure I caught that — try again.";
      destination = '';
    }
  } catch (err) {
    console.error('[drive/plan-route] Anthropic call failed:', err);
    return NextResponse.json(
      { error: 'parse_failed', message: "I'm having trouble understanding right now. Try again in a moment." },
      { status: 502 },
    );
  }

  // If Claude only wanted to clarify or chat, return without geocoding.
  if (intent !== 'navigate' || !destination) {
    return NextResponse.json({
      intent,
      reply: spokenReply || "I'm not sure I got that — can you say it again?",
      preferenceUpdate: preferenceUpdate || undefined,
    });
  }

  // 2. Geocode the destination near the user's current location.
  //    First pass: tight to the user's country (if known). Returns up to 5 candidates,
  //    we pick the one nearest the user's GPS. Second pass (fallback) drops the country
  //    constraint in case Claude expanded into a region the IP-country missed.
  async function geocode(query: string, withCountry: boolean): Promise<{ lng: number; lat: number; placeName: string } | null> {
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN!,
      proximity: `${body.origin!.lng},${body.origin!.lat}`,
      limit: '5',
      language: 'en',
      types: 'poi,address,place,locality,neighborhood',
    });
    if (withCountry && country) params.set('country', country.toLowerCase());
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`;
    const r = await fetch(url);
    if (!r.ok) {
      const bodyText = await r.text().catch(() => '');
      console.warn(`[drive/plan-route] Geocode HTTP ${r.status} for "${query}" :: ${bodyText.slice(0, 200)}`);
      return null;
    }
    const d = await r.json();
    const feats = (d.features || []) as Array<{ center: [number, number]; place_name: string }>;
    if (!feats.length) {
      console.log(`[drive/plan-route] Geocode 200 but 0 features for "${query}" (country=${withCountry ? country : 'none'})`);
      return null;
    }
    // Re-rank by haversine distance from the driver's current location.
    let best = feats[0];
    let bestDist = haversineMiles(body.origin!.lat, body.origin!.lng, best.center[1], best.center[0]);
    for (let i = 1; i < feats.length; i++) {
      const d2 = haversineMiles(body.origin!.lat, body.origin!.lng, feats[i].center[1], feats[i].center[0]);
      if (d2 < bestDist) { best = feats[i]; bestDist = d2; }
    }
    return { lng: best.center[0], lat: best.center[1], placeName: best.place_name };
  }

  /**
   * Strip middle parts that look like a (likely-hallucinated) street address.
   * "Kelley Barracks, MadeUpStraße 1, 70567 Stuttgart, Germany"
   *  → "Kelley Barracks, Stuttgart, Germany"
   * Keeps the first segment (place name) and last 1-2 segments (city, country).
   */
  function stripPossibleStreet(input: string): string | null {
    const parts = input.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length < 4) return null; // already short
    const first = parts[0];
    const last = parts[parts.length - 1];
    const cityCandidate = parts[parts.length - 2].replace(/^\d{4,6}\s+/, ''); // drop postal code prefix
    if (!cityCandidate) return null;
    const stripped = `${first}, ${cityCandidate}, ${last}`;
    return stripped !== input ? stripped : null;
  }

  // Short-circuit 1: keepDestination — user is just modifying the route style
  // ('I want highways' / 'no tolls') for the SAME place they're already going.
  // Reuse the existing destinationCoords so we don't re-geocode and risk a
  // fuzzy-match swap (e.g. 'Öhringen' → 'Böhringen').
  let geocoded: { lng: number; lat: number; placeName: string } | null = null;
  if (keepDestination && body.currentRoute?.destinationCoords) {
    geocoded = {
      lng: body.currentRoute.destinationCoords.lng,
      lat: body.currentRoute.destinationCoords.lat,
      placeName: body.currentRoute.destination || destination,
    };
    console.log(`[drive/plan-route] keepDestination — reusing "${geocoded.placeName}"`);
  }
  // Short-circuit 2: trustedDestination — user picked an autocomplete suggestion
  // that we already retrieved from SearchBox. Use those coords directly.
  if (!geocoded && body.trustedDestination && typeof body.trustedDestination.lng === 'number' && typeof body.trustedDestination.lat === 'number') {
    geocoded = {
      lng: body.trustedDestination.lng,
      lat: body.trustedDestination.lat,
      placeName: body.trustedDestination.placeName || destination,
    };
    console.log(`[drive/plan-route] Using trusted destination: "${geocoded.placeName}"`);
  }
  if (!geocoded) geocoded = await geocode(destination, true);
  if (!geocoded && country) {
    // Retry without country bias in case the destination's region was inferred wrong.
    geocoded = await geocode(destination, false);
  }
  if (!geocoded) {
    // Third pass: strip the (possibly hallucinated) street and try just place + city + country.
    const stripped = stripPossibleStreet(destination);
    if (stripped) {
      console.log(`[drive/plan-route] Geocode fallback (drop street): "${destination}" → "${stripped}"`);
      geocoded = await geocode(stripped, true);
      if (!geocoded && country) geocoded = await geocode(stripped, false);
    }
  }
  if (!geocoded) {
    // Fourth pass: drop the PLACE NAME instead and route to the street address.
    // Mapbox is excellent at addresses but weak on niche POIs like military bases.
    // Routing to the address gets you to the right physical spot anyway.
    const parts = destination.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 4) {
      const addressOnly = parts.slice(1).join(', ');
      console.log(`[drive/plan-route] Geocode fallback (drop place name): "${destination}" → "${addressOnly}"`);
      geocoded = await geocode(addressOnly, true);
      if (!geocoded && country) geocoded = await geocode(addressOnly, false);
    }
  }
  if (!geocoded) {
    // Fifth pass: Mapbox SearchBox API — newer, purpose-built for POI matching.
    // Better at pools, restaurants, military bases than legacy v5 geocoding.
    try {
      const sbParams = new URLSearchParams({
        q: destination,
        access_token: MAPBOX_TOKEN!,
        proximity: `${body.origin.lng},${body.origin.lat}`,
        limit: '5',
        language: 'en',
      });
      if (country) sbParams.set('country', country.toLowerCase());
      const sbUrl = `https://api.mapbox.com/search/searchbox/v1/forward?${sbParams.toString()}`;
      console.log(`[drive/plan-route] Trying Mapbox SearchBox: "${destination}"`);
      const sbRes = await fetch(sbUrl);
      if (sbRes.ok) {
        const sbData = await sbRes.json();
        const sbFeats = (sbData.features || []) as Array<{
          geometry?: { coordinates?: [number, number] };
          properties?: { full_address?: string; name?: string };
        }>;
        if (sbFeats.length > 0) {
          let bestSb = sbFeats[0];
          let bestSbDist = Infinity;
          for (const f of sbFeats) {
            const c = f.geometry?.coordinates;
            if (!c) continue;
            const d = haversineMiles(body.origin.lat, body.origin.lng, c[1], c[0]);
            if (d < bestSbDist) { bestSb = f; bestSbDist = d; }
          }
          const c = bestSb.geometry?.coordinates;
          if (c) {
            geocoded = {
              lng: c[0],
              lat: c[1],
              placeName: bestSb.properties?.full_address || bestSb.properties?.name || destination,
            };
            console.log(`[drive/plan-route] SearchBox found: "${geocoded.placeName}"`);
          }
        }
      } else {
        console.warn('[drive/plan-route] SearchBox HTTP', sbRes.status);
      }
    } catch (err) {
      console.warn('[drive/plan-route] SearchBox error:', err);
    }
  }
  if (!geocoded) {
    console.warn(`[drive/plan-route] All geocode attempts failed for: "${destination}"`);
    return NextResponse.json(
      { error: 'not_found', message: `I couldn't find "${destination}". Try saying the full address or adding the city.` },
      { status: 200 },
    );
  }
  console.log(`[drive/plan-route] Final destination: "${geocoded.placeName}" at ${geocoded.lat.toFixed(4)},${geocoded.lng.toFixed(4)}`);
  const { lng: destLng, lat: destLat, placeName } = geocoded;

  // 3. Get driving directions from origin → destination (→ origin if round-trip).
  const coords = isRoundTrip
    ? `${body.origin.lng},${body.origin.lat};${destLng},${destLat};${body.origin.lng},${body.origin.lat}`
    : `${body.origin.lng},${body.origin.lat};${destLng},${destLat}`;
  // driving-traffic profile factors live traffic into the ETA. steps=true so the
  // client can render turn-by-turn cards + speak voiceInstructions at the right
  // moments. overview=full ensures geometry aligns 1:1 with the annotation arrays.
  // exclude= forces Mapbox to actually route around motorways/tolls/ferries when
  // the driver said "no highways" / "back roads only" / etc.
  const excludeList: string[] = [];
  if (routePreferences.avoidHighways) excludeList.push('motorway');
  if (routePreferences.avoidTolls) excludeList.push('toll');
  if (routePreferences.avoidFerries) excludeList.push('ferry');
  const excludeParam = excludeList.length > 0 ? `&exclude=${excludeList.join(',')}` : '';
  const dirUrl = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coords}?geometries=geojson&overview=full&steps=true&annotations=maxspeed&voice_instructions=true&voice_units=imperial&banner_instructions=true&language=en${excludeParam}&access_token=${MAPBOX_TOKEN}`;
  const dirRes = await fetch(dirUrl);
  if (!dirRes.ok) {
    console.error('[drive/plan-route] Mapbox directions failed:', dirRes.status);
    return NextResponse.json(
      { error: 'directions_failed', message: "I couldn't plan that route right now. Try again in a moment." },
      { status: 502 },
    );
  }
  const dirData = await dirRes.json();
  const route = dirData.routes?.[0];
  if (!route) {
    return NextResponse.json(
      { error: 'no_route', message: `I couldn't find a driving route to ${placeName}. Try a different destination.` },
      { status: 200 },
    );
  }

  const milesNum = route.distance / 1609.34;
  const miles = milesNum.toFixed(1);
  const minutes = Math.max(1, Math.round(route.duration / 60));
  const summary = isRoundTrip
    ? `Round trip to ${placeName}. ${miles} miles total, about ${minutes} minutes.`
    : `Route to ${placeName}. ${miles} miles, about ${minutes} minutes.`;

  // Fuel-needed estimate: trip miles ÷ vehicle's combined MPG.
  let fuelNeeded: { gallons: number; tankPercent: number | null; mpgUsed: number } | null = null;
  if (body.vehicle) {
    try {
      const { getVehicleSpecs } = await import('@/lib/maintenance');
      const vSpecs = getVehicleSpecs({ year: body.vehicle.year, make: body.vehicle.make, model: body.vehicle.model, trim: body.vehicle.trim });
      const mpg = vSpecs?.fuelEconomy?.combined;
      const tank = vSpecs?.tankCapacity?.gallons;
      if (mpg && mpg > 0) {
        const gallons = milesNum / mpg;
        fuelNeeded = {
          gallons: Math.round(gallons * 10) / 10,
          tankPercent: tank ? Math.round((gallons / tank) * 100) : null,
          mpgUsed: mpg,
        };
      }
    } catch { /* non-blocking */ }
  }

  // Flatten per-segment maxspeed annotations from every leg so the client can
  // align them with route.geometry.coordinates (N coords → N-1 segments).
  // Mapbox returns objects like { speed: 55, unit: 'mph' }, { unknown: true }, or { none: true } (no limit).
  interface MaxSpeedEntry { speed: number | null; unit: 'mph' | 'km/h' | null; unknown?: boolean; none?: boolean }
  const speedLimits: MaxSpeedEntry[] = [];
  if (Array.isArray(route.legs)) {
    for (const leg of route.legs) {
      const arr = leg?.annotation?.maxspeed;
      if (Array.isArray(arr)) {
        for (const m of arr) {
          if (m?.none) speedLimits.push({ speed: null, unit: null, none: true });
          else if (m?.unknown) speedLimits.push({ speed: null, unit: null, unknown: true });
          else if (typeof m?.speed === 'number') {
            const unit = m.unit === 'km/h' ? 'km/h' : 'mph';
            speedLimits.push({ speed: m.speed, unit });
          } else {
            speedLimits.push({ speed: null, unit: null, unknown: true });
          }
        }
      }
    }
  }

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

  // Parking lookup: if Claude flagged the destination as parking-challenged, pull
  // 3 nearest parking options via Mapbox Geocoding, biased toward the destination.
  interface ParkingOption { name: string; lng: number; lat: number; walkingBlocks: number }
  let parkingOptions: ParkingOption[] = [];
  let parkingNote = '';
  if (needsParkingSearch) {
    try {
      const parkUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent('parking')}.json?proximity=${destLng},${destLat}&limit=3&access_token=${MAPBOX_TOKEN}`;
      const parkRes = await fetch(parkUrl);
      if (parkRes.ok) {
        const parkData = await parkRes.json();
        for (const feat of parkData.features || []) {
          const [pLng, pLat] = feat.center as [number, number];
          const distMi = haversineMiles(destLat, destLng, pLat, pLng);
          // Rough walking distance: 1 city block ≈ 0.05 mi, so multiply by 20.
          parkingOptions.push({
            name: feat.text || feat.place_name || 'Parking',
            lng: pLng,
            lat: pLat,
            walkingBlocks: Math.max(1, Math.round(distMi * 20)),
          });
        }
      }
    } catch { /* non-blocking */ }
    if (parkingOptions.length > 0) {
      const closest = parkingOptions[0];
      parkingNote = `Heads up, parking there is tough. I marked ${parkingOptions.length} nearby option${parkingOptions.length === 1 ? '' : 's'} — closest is ${closest.name}, about ${closest.walkingBlocks} block${closest.walkingBlocks === 1 ? '' : 's'} walk.`;
    }
  }

  // Prefer Claude's conversational reply; fall back to the deterministic summary.
  const baseReply = spokenReply
    ? `${spokenReply} ${miles} miles${isRoundTrip ? ' round trip' : ''}, about ${minutes} minutes.`
    : summary;
  const fuelLineSpoken = fuelNeeded
    ? fuelNeeded.tankPercent != null
      ? `That'll use about ${fuelNeeded.gallons} gallons — roughly ${fuelNeeded.tankPercent}% of your tank.`
      : `That'll use about ${fuelNeeded.gallons} gallons.`
    : '';
  const parts = [baseReply];
  if (fuelLineSpoken) parts.push(fuelLineSpoken);
  if (fuelWarning) parts.push(fuelWarning);
  if (parkingNote) parts.push(parkingNote);
  const reply = parts.join(' ');

  // Flatten step-by-step maneuvers from every leg for the client's
  // turn-by-turn UI + voice prompts.
  interface NavStep {
    instruction: string;
    distance: number;       // meters
    duration: number;       // seconds
    location: [number, number]; // lng, lat
    voice?: Array<{ distanceAlongGeometry: number; announcement: string }>;
  }
  const steps: NavStep[] = [];
  if (Array.isArray(route.legs)) {
    for (const leg of route.legs) {
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
    speedLimits,
    parkingOptions,
    steps,
    tripIntelligence,
    fuelNeeded,
    isRoundTrip,
    routePreferences,
    preferenceUpdate: preferenceUpdate || undefined,
  });
}
