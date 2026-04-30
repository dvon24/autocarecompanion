import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  driveTurnMinuteLimiter,
  driveTurnDayLimiter,
  getClientIp,
} from '@/lib/rate-limit';
import { auth } from '@/lib/auth';
import { runPreTripSafetyCheck, buildVoiceSafetyPromptSlice } from '@/lib/pre-trip-safety';

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
  /** ISO-639 language code for Claude's spoken reply ('en' or 'de' currently). */
  language?: 'en' | 'de';
  /** Rolling average driving speed in mph from the GPS watcher. Used to pick
   * the right MPG band (city / combined / highway) for fuel projection. */
  avgSpeedMph?: number | null;
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

interface RouteCamera { id: string; lat: number; lng: number; type: string; maxspeed?: string }

/**
 * Fetch speed camera + enforcement nodes from OpenStreetMap Overpass for the
 * bbox enclosing the given route geometry. Padded by ~500m so cameras just
 * off the polyline still come through. Returns [] on any failure.
 */
async function fetchCamerasForGeometry(coords: number[][]): Promise<RouteCamera[]> {
  if (!Array.isArray(coords) || coords.length < 2) return [];
  let south = 90, west = 180, north = -90, east = -180;
  for (const [lng, lat] of coords) {
    if (lat < south) south = lat;
    if (lat > north) north = lat;
    if (lng < west) west = lng;
    if (lng > east) east = lng;
  }
  const pad = 0.005; // ~500 m
  south -= pad; west -= pad; north += pad; east += pad;
  // Overpass caps any single-bbox query; if the route crosses an entire
  // country we just bail rather than hammer the public API.
  if ((north - south) > 1.5 || (east - west) > 2.0) return [];
  const query = `[out:json][timeout:10];
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
        'User-Agent': 'Au7o-Drive/1.0 (+https://au7o.io)',
        'Accept': 'application/json',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(11000),
    });
    if (!r.ok) return [];
    const data = await r.json();
    interface OverpassNode { id: number; lat: number; lon: number; tags?: Record<string, string> }
    const elements = (data.elements || []) as OverpassNode[];
    const cameras: RouteCamera[] = [];
    for (const e of elements) {
      const tags = e.tags || {};
      let type: RouteCamera['type'] = 'unknown';
      if (tags.enforcement === 'average_speed') type = 'avg-speed';
      else if (tags.enforcement === 'traffic_signals') type = 'red-light';
      else if (tags.enforcement === 'maxspeed' || tags.highway === 'speed_camera') type = 'fixed';
      if (tags.zone === 'school' || tags['school'] === 'yes') type = 'school-zone';
      cameras.push({ id: `osm-${e.id}`, lat: e.lat, lng: e.lon, type, maxspeed: tags.maxspeed });
    }
    return cameras;
  } catch { return []; }
}

/**
 * Count cameras within `maxMeters` of any point on the polyline. Used to
 * score Mapbox route alternates so we can pick the one with fewest cameras.
 * Sampled every Nth point for speed.
 */
function countCamerasOnRoute(coords: number[][], cameras: RouteCamera[], maxMeters: number): number {
  if (cameras.length === 0 || coords.length === 0) return 0;
  const stride = Math.max(1, Math.floor(coords.length / 200));
  let count = 0;
  // Convert maxMeters to a rough lat/lng box per camera for fast pre-filter.
  const degThreshold = maxMeters / 111_000 + 0.0005;
  for (const cam of cameras) {
    let hit = false;
    for (let i = 0; i < coords.length; i += stride) {
      const [lng, lat] = coords[i];
      if (Math.abs(lat - cam.lat) > degThreshold || Math.abs(lng - cam.lng) > degThreshold) continue;
      const dLat = (cam.lat - lat) * Math.PI / 180;
      const dLng = (cam.lng - lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(cam.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
      const distM = 2 * 6371_000 * Math.asin(Math.sqrt(a));
      if (distM <= maxMeters) { hit = true; break; }
    }
    if (hit) count++;
  }
  return count;
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

  const lang = body.language === 'de' ? 'de' : 'en';
  const langLine = lang === 'de'
    ? 'WICHTIG: Antworte ausschließlich auf Deutsch. Sprich den Fahrer wie ein Freund an, nicht förmlich.'
    : 'IMPORTANT: Reply in English. Speak to the driver like a friend, not formally.';

  // Pre-trip safety slice for the voice copilot. Pulls overdue maintenance
  // + high-severity known issues for the driver's primary vehicle (when
  // signed in) and teaches Claude to weave at most ONE item into the
  // spoken reply naturally — like a buddy mechanic, not a disclaimer reader.
  // Trip-mile-dependent items (fuel range) are intentionally LEFT OUT here
  // because Mapbox hasn't run yet; the visual /pre-trip-check call later
  // surfaces them on the card.
  let voiceSafetySlice = '';
  try {
    const session = await auth();
    if (session?.user?.id) {
      const safety = await runPreTripSafetyCheck({
        userId: session.user.id,
        tripMiles: null,
        fuelMilesRemaining: typeof body.fuelMilesRemaining === 'number' ? body.fuelMilesRemaining : null,
      });
      voiceSafetySlice = buildVoiceSafetyPromptSlice(safety, lang);
    }
  } catch {
    // Auth or DB hiccup — voice copilot just stays generic for this turn.
  }

  const systemPrompt = `You are Au7o, a voice navigation copilot that runs in the car. Respond like a helpful, concise friend — never verbose.

${langLine}

${locationNote}

${currentRouteNote}

${vehicleNote}

${prefsNote}

${historyNote}
${voiceSafetySlice}

Every turn, return ONLY a JSON object with this shape:
{
  "intent": "navigate" | "clarify" | "chat",
  "destination": "<clean geocodable place or address>",
  "localSearch": {
    "query": "<category search string like 'coffee shop' or 'italian restaurant' — EMPTY when user named a specific place>",
    "minRating": <number 0-5 or null>,
    "openNow": <boolean>,
    "priceMax": <1-4 or null>
  },
  "intermediateStop": {
    "category": "<category like 'coffee shop' / 'restaurant' / 'rest area' / 'park' — empty if no stop wanted>",
    "atTripPercent": <integer 10-90 — where in the trip the stop should happen>,
    "minRating": <number 0-5 or null>,
    "openNow": <boolean>
  },
  "keepDestination": <boolean>,
  "isRoundTrip": <boolean>,
  "routePreferences": {
    "avoidHighways": <boolean>,
    "avoidTolls": <boolean>,
    "avoidFerries": <boolean>,
    "avoidSpeedCameras": <boolean>,
    "routeToParking": <boolean>
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
- intermediateStop: populate when the user wants to BREAK UP the trip with a stop along the way. Examples:
  - "scenic drive with a coffee shop built in for a break" → category="coffee shop", atTripPercent=50, openNow=true
  - "take me to Munich, stop for lunch on the way" → category="restaurant", atTripPercent=50, openNow=true
  - "long drive, want to grab a snack midway" → category="cafe", atTripPercent=50, openNow=true
  - "find me a park to stretch my legs around halfway" → category="park", atTripPercent=50
  Leave category="" when no stop is wanted (default). atTripPercent should usually be 50 unless the user specified ("a quarter of the way in" → 25, "about an hour from now" → estimate based on trip duration).
- localSearch: populate when the user is asking for a CATEGORY of place rather than a specific named one. Examples:
  - "find me a coffee shop nearby" → query="coffee shop", openNow=true
  - "best italian restaurant within 10 minutes" → query="italian restaurant", minRating=4.0, openNow=true
  - "a cheap burger place" → query="burger restaurant", priceMax=2
  - "highly rated bar to grab a drink" → query="bar", minRating=4.0, openNow=true
  - "find me a gas station" → query="gas station", openNow=true
  When set, the server will search Google Places for real candidates and pick the best one — your "destination" string becomes a fallback hint. Leave query="" when the user named a specific place ("take me to Starbucks on Main St", "Mediterraneo restaurant"). Set openNow=true by default for food/drink/services unless the user said otherwise.
- isRoundTrip: TRUE when the user wants to come back to their starting point — phrases like "round trip", "and back", "back home", "loop", "return trip", "there and back", or "nice drive" / "scenic drive" with no specific destination they want to end at. Otherwise FALSE.
- routePreferences: extract ONLY from the user's CURRENT message. **Do NOT** read these from stored DRIVER PREFERENCES — preferences are advisory background, not per-trip routing rules. Each trip starts clean unless the user re-asks this turn.
  - avoidHighways: TRUE ONLY when the CURRENT message contains EXPLICIT highway-avoidance language — "no highways", "avoid highways", "no motorways", "no autobahn", "back roads only", "back roads instead", "no interstates". **Default FALSE.** Saying "scenic drive", "nice drive", "take me somewhere fun", "long drive", or anything aesthetic does NOT make this TRUE.
  - avoidTolls: TRUE ONLY when the CURRENT message says "no tolls", "avoid tolls", "don't take the tollway". Default FALSE.
  - avoidFerries: TRUE ONLY when the CURRENT message says "no ferries". Default FALSE.
  - avoidSpeedCameras: TRUE ONLY when the CURRENT message says "avoid speed cameras", "no speed cameras", "go around the cameras", "route around speed traps", "kein Blitzer" / "Blitzer vermeiden" (DE), "ohne Blitzer". Default FALSE. The system will look at route alternatives and pick the one with the fewest camera/enforcement nodes.
  - routeToParking: TRUE ONLY when the CURRENT message says something like "park me there", "find parking and drop me off", "take me to parking", "route to the parking lot", "lass mich parken", "park mich". Default FALSE. When TRUE the system will route directly to the closest parking lot near the venue instead of the venue itself.
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
  const routePreferences = { avoidHighways: false, avoidTolls: false, avoidFerries: false, avoidSpeedCameras: false, routeToParking: false };
  const localSearch = { query: '', minRating: null as number | null, openNow: false, priceMax: null as number | null };
  const intermediateStop = { category: '', atTripPercent: 50, minRating: null as number | null, openNow: false };
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
      const rp = parsed.routePreferences as { avoidHighways?: unknown; avoidTolls?: unknown; avoidFerries?: unknown; avoidSpeedCameras?: unknown; routeToParking?: unknown } | undefined;
      if (rp && typeof rp === 'object') {
        routePreferences.avoidHighways = rp.avoidHighways === true;
        routePreferences.avoidTolls = rp.avoidTolls === true;
        routePreferences.avoidFerries = rp.avoidFerries === true;
        routePreferences.avoidSpeedCameras = rp.avoidSpeedCameras === true;
        routePreferences.routeToParking = rp.routeToParking === true;
      }
      const ls = parsed.localSearch as { query?: unknown; minRating?: unknown; openNow?: unknown; priceMax?: unknown } | undefined;
      if (ls && typeof ls === 'object') {
        localSearch.query = String(ls.query || '').trim();
        if (typeof ls.minRating === 'number') localSearch.minRating = Math.max(0, Math.min(5, ls.minRating));
        localSearch.openNow = ls.openNow === true;
        if (typeof ls.priceMax === 'number') localSearch.priceMax = Math.max(1, Math.min(4, ls.priceMax));
      }
      const isr = parsed.intermediateStop as { category?: unknown; atTripPercent?: unknown; minRating?: unknown; openNow?: unknown } | undefined;
      if (isr && typeof isr === 'object') {
        intermediateStop.category = String(isr.category || '').trim();
        if (typeof isr.atTripPercent === 'number') intermediateStop.atTripPercent = Math.max(10, Math.min(90, isr.atTripPercent));
        if (typeof isr.minRating === 'number') intermediateStop.minRating = Math.max(0, Math.min(5, isr.minRating));
        intermediateStop.openNow = isr.openNow === true;
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

  // Short-circuit 3: hardcoded military bases + niche landmarks that all
  // public geocoders fumble. Mapbox + Google both resolve "Kelley Barracks"
  // to downtown Stuttgart instead of the actual base in Möhringen — these
  // are off-map by design (no street signs, no Google reviews) and the
  // only fix is a known-good fallback. Match is fuzzy: lowercased,
  // whitespace-normalized substring check on the destination string.
  if (!geocoded) {
    const HARDCODED_DESTINATIONS: { match: string[]; lng: number; lat: number; placeName: string }[] = [
      // Kelley Barracks, Möhringen (USAG Stuttgart HQ / EUCOM)
      {
        match: ['kelley barracks', 'kelley kaserne'],
        lng: 9.150566,
        lat: 48.701389,
        placeName: 'Kelley Barracks, Plieninger Str. 100, 70567 Stuttgart, Germany',
      },
      // Patch Barracks, Vaihingen (USEUCOM, US Army)
      {
        match: ['patch barracks', 'patch kaserne'],
        lng: 9.094167,
        lat: 48.728889,
        placeName: 'Patch Barracks, 70569 Stuttgart-Vaihingen, Germany',
      },
      // Robinson Barracks, Burgholzhof
      {
        match: ['robinson barracks'],
        lng: 9.213056,
        lat: 48.831667,
        placeName: 'Robinson Barracks, 70376 Stuttgart, Germany',
      },
      // Panzer Kaserne (USAG Stuttgart, Böblingen)
      {
        match: ['panzer kaserne', 'panzer barracks'],
        lng: 9.012778,
        lat: 48.694167,
        placeName: 'Panzer Kaserne, 71032 Böblingen, Germany',
      },
    ];
    const dq = destination.toLowerCase().replace(/\s+/g, ' ').trim();
    const hit = HARDCODED_DESTINATIONS.find((h) => h.match.some((m) => dq.includes(m)));
    if (hit) {
      geocoded = { lng: hit.lng, lat: hit.lat, placeName: hit.placeName };
      console.log(`[drive/plan-route] Hardcoded landmark match: "${destination}" → ${hit.placeName}`);
    }
  }

  // Mapbox SearchBox /forward — POI-aware, way better at niche places like
  // 'Mummelsee in the Black Forest' or 'REWE in Öhringen' than legacy
  // Geocoding v5 which over-fuzzy-matches to nearby unrelated places.
  // Tried FIRST so most destinations resolve correctly without ever hitting
  // the legacy chain.
  async function searchBoxForward(query: string): Promise<{ lng: number; lat: number; placeName: string } | null> {
    try {
      const sbParams = new URLSearchParams({
        q: query,
        access_token: MAPBOX_TOKEN!,
        proximity: `${body.origin!.lng},${body.origin!.lat}`,
        limit: '5',
        language: 'en',
      });
      if (country) sbParams.set('country', country.toLowerCase());
      const sbRes = await fetch(`https://api.mapbox.com/search/searchbox/v1/forward?${sbParams.toString()}`);
      if (!sbRes.ok) {
        console.warn(`[drive/plan-route] SearchBox forward HTTP ${sbRes.status} for "${query}"`);
        return null;
      }
      const sbData = await sbRes.json();
      const sbFeats = (sbData.features || []) as Array<{
        geometry?: { coordinates?: [number, number] };
        properties?: { full_address?: string; name?: string; place_formatted?: string };
      }>;
      if (!sbFeats.length) return null;
      let best = sbFeats[0];
      let bestDist = Infinity;
      for (const f of sbFeats) {
        const c = f.geometry?.coordinates;
        if (!c) continue;
        const d = haversineMiles(body.origin!.lat, body.origin!.lng, c[1], c[0]);
        if (d < bestDist) { best = f; bestDist = d; }
      }
      const c = best.geometry?.coordinates;
      if (!c) return null;
      return {
        lng: c[0],
        lat: c[1],
        placeName: best.properties?.full_address || best.properties?.place_formatted || best.properties?.name || query,
      };
    } catch { return null; }
  }

  // AI-driven local search: when Claude flagged this as a category search
  // ("find me a coffee shop"), call Google Places Text Search with the
  // user's GPS as bias + Claude's filters (rating / open-now / price), then
  // pick the top result. Skip the rest of the geocode chain — Google's
  // result is the trusted destination.
  let localSearchPick: { placeName: string; rating?: number | null; ratingCount?: number | null; openNow?: boolean | null } | null = null;
  if (!geocoded && localSearch.query && process.env.GOOGLE_PLACES_API_KEY) {
    try {
      const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours.openNow';
      const gRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify({
          textQuery: localSearch.query,
          languageCode: lang,
          maxResultCount: 10,
          openNow: localSearch.openNow || undefined,
          minRating: localSearch.minRating || undefined,
          priceLevels: localSearch.priceMax ? Array.from({ length: localSearch.priceMax }, (_, i) => `PRICE_LEVEL_${['INEXPENSIVE','MODERATE','EXPENSIVE','VERY_EXPENSIVE'][i]}`) : undefined,
          locationBias: {
            circle: {
              center: { latitude: body.origin.lat, longitude: body.origin.lng },
              radius: 15000, // 15 km
            },
          },
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (gRes.ok) {
        const gData = await gRes.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const candidates = (gData.places || []) as any[];
        // Score: rating × log(reviewCount + 1) − distance penalty.
        let best: { place: typeof candidates[number]; score: number } | null = null;
        for (const p of candidates) {
          const loc = p.location;
          if (!loc) continue;
          const dist = haversineMiles(body.origin.lat, body.origin.lng, loc.latitude, loc.longitude);
          const rating = typeof p.rating === 'number' ? p.rating : 3.5;
          const count = typeof p.userRatingCount === 'number' ? p.userRatingCount : 1;
          const score = rating * Math.log10(count + 10) - dist * 0.05;
          if (!best || score > best.score) best = { place: p, score };
        }
        if (best) {
          const p = best.place;
          geocoded = {
            lng: p.location.longitude,
            lat: p.location.latitude,
            placeName: p.displayName?.text || p.formattedAddress || localSearch.query,
          };
          localSearchPick = {
            placeName: geocoded.placeName,
            rating: typeof p.rating === 'number' ? p.rating : null,
            ratingCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
            openNow: p.currentOpeningHours?.openNow ?? null,
          };
          console.log(`[drive/plan-route] Local search picked: "${geocoded.placeName}" (${localSearchPick.rating} ★, ${localSearchPick.ratingCount} reviews)`);
        }
      } else {
        console.warn('[drive/plan-route] Google local search HTTP', gRes.status);
      }
    } catch (err) {
      console.warn('[drive/plan-route] Google local search error:', err);
    }
  }

  if (!geocoded) {
    geocoded = await searchBoxForward(destination);
    if (geocoded) console.log(`[drive/plan-route] SearchBox forward (1st): "${geocoded.placeName}"`);
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
  // When the driver asked to avoid speed cameras, request alternatives so we
  // can score each candidate by camera count and pick the lowest. Otherwise
  // skip alternates to keep the response payload small.
  const altParam = routePreferences.avoidSpeedCameras ? '&alternatives=true' : '';
  const dirUrl = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coords}?geometries=geojson&overview=full&steps=true&annotations=maxspeed&voice_instructions=true&voice_units=imperial&banner_instructions=true&language=en${altParam}${excludeParam}&access_token=${MAPBOX_TOKEN}`;
  const dirRes = await fetch(dirUrl);
  if (!dirRes.ok) {
    console.error('[drive/plan-route] Mapbox directions failed:', dirRes.status);
    return NextResponse.json(
      { error: 'directions_failed', message: "I couldn't plan that route right now. Try again in a moment." },
      { status: 502 },
    );
  }
  const dirData = await dirRes.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let route: any = dirData.routes?.[0];
  if (!route) {
    return NextResponse.json(
      { error: 'no_route', message: `I couldn't find a driving route to ${placeName}. Try a different destination.` },
      { status: 200 },
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allRouteCandidates: any[] = Array.isArray(dirData.routes) ? dirData.routes : [route];

  // Speed-camera-aware re-routing: when the driver asked to avoid cameras,
  // fetch all enforcement nodes for the route's bbox, score each Mapbox
  // candidate by how many it passes within 200m, and pick the lowest. Falls
  // back to the default if Overpass is empty/down.
  let cameraAvoidanceNote = '';
  let routeCameras: RouteCamera[] = [];
  if (routePreferences.avoidSpeedCameras && route.geometry?.coordinates) {
    routeCameras = await fetchCamerasForGeometry(route.geometry.coordinates as number[][]);
    if (routeCameras.length > 0 && allRouteCandidates.length > 1) {
      const scored = allRouteCandidates.map((r) => ({
        r,
        cams: countCamerasOnRoute(r.geometry?.coordinates || [], routeCameras, 200),
        durationDelta: r.duration - route.duration,
      }));
      // Sort: fewest cameras first, then shortest. If the chosen alt adds
      // more than 25% to ETA, stay on the default — driver probably doesn't
      // want a 2x detour for 1 fewer camera.
      scored.sort((a, b) => a.cams - b.cams || a.r.duration - b.r.duration);
      const baseCount = scored.find((s) => s.r === route)?.cams ?? scored[0].cams;
      const best = scored[0];
      const acceptable = best.r.duration <= route.duration * 1.25;
      if (best.r !== route && best.cams < baseCount && acceptable) {
        const saved = baseCount - best.cams;
        cameraAvoidanceNote = lang === 'de'
          ? `Route gewählt mit ${saved} Blitzer${saved === 1 ? '' : 'n'} weniger.`
          : `Picked a route with ${saved} fewer camera${saved === 1 ? '' : 's'}.`;
        route = best.r;
      } else if (baseCount > 0) {
        cameraAvoidanceNote = lang === 'de'
          ? `Keine bessere Route gefunden — ${baseCount} Blitzer auf der Strecke.`
          : `No better route found — ${baseCount} camera${baseCount === 1 ? '' : 's'} on the way.`;
      }
    } else if (routeCameras.length === 0) {
      cameraAvoidanceNote = lang === 'de'
        ? 'Keine bekannten Blitzer auf der Strecke.'
        : 'No known cameras on this route.';
    }
  }

  let milesNum = route.distance / 1609.34;
  // Intermediate stop: pick a Google Place at N% along the route, then
  // recompute Mapbox Directions through it. Result becomes the new primary.
  interface IntermediateStopResult { name: string; address: string; lng: number; lat: number; rating: number | null; ratingCount: number | null; openNow: boolean | null; milesIn: number }
  let intermediateStopResult: IntermediateStopResult | null = null;
  if (intermediateStop.category && process.env.GOOGLE_PLACES_API_KEY) {
    try {
      const targetMiles = milesNum * (intermediateStop.atTripPercent / 100);
      const point = pointAtMilesAlongRoute(route.geometry.coordinates as number[][], targetMiles);
      if (point) {
        const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours.openNow';
        const stopRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': fieldMask,
          },
          body: JSON.stringify({
            textQuery: intermediateStop.category,
            languageCode: lang,
            maxResultCount: 8,
            openNow: intermediateStop.openNow || undefined,
            minRating: intermediateStop.minRating || undefined,
            locationBias: { circle: { center: { latitude: point[1], longitude: point[0] }, radius: 5000 } },
          }),
          signal: AbortSignal.timeout(8000),
        });
        if (stopRes.ok) {
          const stopData = await stopRes.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const candidates = (stopData.places || []) as any[];
          // Score: rating × log(reviewCount) − distance from intended midpoint.
          let best: { p: typeof candidates[number]; score: number } | null = null;
          for (const p of candidates) {
            if (!p.location) continue;
            const dist = haversineMiles(point[1], point[0], p.location.latitude, p.location.longitude);
            const rating = typeof p.rating === 'number' ? p.rating : 3.5;
            const count = typeof p.userRatingCount === 'number' ? p.userRatingCount : 1;
            const score = rating * Math.log10(count + 10) - dist * 0.5;
            if (!best || score > best.score) best = { p, score };
          }
          if (best) {
            const p = best.p;
            const stopLng = p.location.longitude;
            const stopLat = p.location.latitude;
            // Recompute the directions through the new waypoint.
            const stopCoords = isRoundTrip
              ? `${body.origin.lng},${body.origin.lat};${stopLng},${stopLat};${destLng},${destLat};${body.origin.lng},${body.origin.lat}`
              : `${body.origin.lng},${body.origin.lat};${stopLng},${stopLat};${destLng},${destLat}`;
            const stopDirUrl = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${stopCoords}?geometries=geojson&overview=full&steps=true&annotations=maxspeed&voice_instructions=true&voice_units=imperial&banner_instructions=true&language=en&alternatives=false${excludeParam}&access_token=${MAPBOX_TOKEN}`;
            const stopDirRes = await fetch(stopDirUrl);
            if (stopDirRes.ok) {
              const stopDirData = await stopDirRes.json();
              const newRoute = stopDirData.routes?.[0];
              if (newRoute) {
                // Override route with the via-stop variant.
                Object.assign(route, newRoute);
                milesNum = newRoute.distance / 1609.34;
                intermediateStopResult = {
                  name: p.displayName?.text || intermediateStop.category,
                  address: p.formattedAddress || '',
                  lng: stopLng,
                  lat: stopLat,
                  rating: typeof p.rating === 'number' ? p.rating : null,
                  ratingCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
                  openNow: p.currentOpeningHours?.openNow ?? null,
                  milesIn: Math.round(targetMiles),
                };
                console.log(`[drive/plan-route] Intermediate stop: "${intermediateStopResult.name}" at ~${intermediateStopResult.milesIn} mi`);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[drive/plan-route] intermediate stop error:', err);
    }
  }
  // miles/minutes get recomputed once more after route-to-parking swap below;
  // declared as `let` so we can refresh them then.
  let miles = milesNum.toFixed(1);
  let minutes = Math.max(1, Math.round(route.duration / 60));
  const summary = lang === 'de'
    ? (isRoundTrip
      ? `Hin- und Rückfahrt nach ${placeName}. ${(milesNum * 1.60934).toFixed(1)} km insgesamt, etwa ${minutes} Minuten.`
      : `Route nach ${placeName}. ${(milesNum * 1.60934).toFixed(1)} km, etwa ${minutes} Minuten.`)
    : (isRoundTrip
      ? `Round trip to ${placeName}. ${miles} miles total, about ${minutes} minutes.`
      : `Route to ${placeName}. ${miles} miles, about ${minutes} minutes.`);

  // Speed-aware effective MPG. Uses rolling avgSpeedMph if available;
  // otherwise falls back to combined. Above 70 mph, applies a 2%-per-mph
  // penalty to model the real-world drag/RPM penalty EPA highway numbers
  // understate.
  function effectiveMpg(city?: number | null, combined?: number | null, highway?: number | null, avg?: number | null): number | null {
    const c = typeof combined === 'number' ? combined : null;
    if (typeof avg !== 'number' || avg <= 0) return c;
    let base: number | null = null;
    if (avg < 30) base = (typeof city === 'number' ? city : c);
    else if (avg < 55) base = c;
    else base = (typeof highway === 'number' ? highway : c);
    if (base == null) return c;
    if (avg > 70) {
      const penalty = 1 - Math.min(0.35, (avg - 70) * 0.02);
      base = base * penalty;
    }
    return Math.max(5, Math.round(base * 10) / 10);
  }

  // Fuel-needed estimate: trip miles ÷ vehicle's effective MPG (speed-aware).
  let fuelNeeded: { gallons: number; tankPercent: number | null; mpgUsed: number; avgSpeedMph: number | null } | null = null;
  let vehicleCity: number | null = null;
  let vehicleCombined: number | null = null;
  let vehicleHighway: number | null = null;
  let vehicleTank: number | null = null;
  if (body.vehicle) {
    try {
      const { getVehicleSpecs } = await import('@/lib/maintenance');
      const vSpecs = getVehicleSpecs({ year: body.vehicle.year, make: body.vehicle.make, model: body.vehicle.model, trim: body.vehicle.trim });
      vehicleCity = vSpecs?.fuelEconomy?.city ?? null;
      vehicleCombined = vSpecs?.fuelEconomy?.combined ?? null;
      vehicleHighway = vSpecs?.fuelEconomy?.highway ?? null;
      vehicleTank = vSpecs?.tankCapacity?.gallons ?? null;
      const mpg = effectiveMpg(vehicleCity, vehicleCombined, vehicleHighway, body.avgSpeedMph);
      if (mpg && mpg > 0) {
        const gallons = milesNum / mpg;
        fuelNeeded = {
          gallons: Math.round(gallons * 10) / 10,
          tankPercent: vehicleTank ? Math.round((gallons / vehicleTank) * 100) : null,
          mpgUsed: mpg,
          avgSpeedMph: typeof body.avgSpeedMph === 'number' ? Math.round(body.avgSpeedMph) : null,
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
  // Auto-default fuel range from the selected vehicle's specs when the
  // user didn't mention how much they have. Uses the speed-aware effective
  // MPG so a Challenger doing 80 mph projects a shorter realistic range
  // than its 19 mpg combined would suggest.
  if (fuelMilesRemaining == null && vehicleTank) {
    const mpg = effectiveMpg(vehicleCity, vehicleCombined, vehicleHighway, body.avgSpeedMph);
    if (mpg && mpg * vehicleTank > 0) {
      fuelMilesRemaining = Math.round(mpg * vehicleTank * 0.9);
      console.log(`[drive/plan-route] Auto fuel range: ${fuelMilesRemaining} mi (${mpg} mpg × ${vehicleTank} gal × 0.9${typeof body.avgSpeedMph === 'number' ? ` at avg ${Math.round(body.avgSpeedMph)} mph` : ''})`);
    }
  }
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
            fuelWarning = lang === 'de'
              ? `Du brauchst Tanken — ${gasFeature.text || 'eine Tankstelle'} etwa ${Math.round(targetMiles * 1.60934)} km voraus markiert.`
              : `You'll need gas — I marked ${gasFeature.text || 'a station'} about ${Math.round(targetMiles)} miles in.`;
          }
        }
      } catch { /* non-blocking */ }
    }
    if (!fuelStops.length) {
      fuelWarning = lang === 'de'
        ? `Achtung — die Strecke ist ${(milesNum * 1.60934).toFixed(1)} km, aber du hast nur etwa ${Math.round(fuelMilesRemaining * 1.60934)} km Reichweite.`
        : `Heads up — trip is ${miles} miles but you only have about ${Math.round(fuelMilesRemaining)} miles of range.`;
    }
  }

  // Parking lookup: if Claude flagged the destination as parking-challenged, pull
  // nearby parking options. Use Google Places (when available) for category-aware
  // POI matching, fall back to Mapbox Geocoding. Bounded to ≤1km from the
  // destination so a "parking" search doesn't return hits in the next country
  // (caused the infamous "82880 blocks walk" bug).
  interface ParkingOption { name: string; lng: number; lat: number; walkMeters: number; walkingBlocks: number }
  let parkingOptions: ParkingOption[] = [];
  let parkingNote = '';
  // routeToParking always implies a parking lookup — driver explicitly asked
  // to be dropped at a parking spot, so we need candidates regardless of
  // Claude's parking-difficulty heuristic.
  if (needsParkingSearch || routePreferences.routeToParking) {
    const collected: ParkingOption[] = [];
    // Try Google Places first — it understands "parking lot" / "parking garage".
    if (process.env.GOOGLE_PLACES_API_KEY) {
      try {
        const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location';
        const pRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': fieldMask,
          },
          body: JSON.stringify({
            textQuery: 'parking',
            languageCode: lang,
            maxResultCount: 8,
            locationBias: { circle: { center: { latitude: destLat, longitude: destLng }, radius: 1000 } },
          }),
          signal: AbortSignal.timeout(7000),
        });
        if (pRes.ok) {
          const pData = await pRes.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const place of (pData.places || []) as any[]) {
            const loc = place.location;
            if (!loc) continue;
            const distMi = haversineMiles(destLat, destLng, loc.latitude, loc.longitude);
            if (distMi > 0.62) continue; // ~1 km cap
            const meters = Math.round(distMi * 1609.34);
            collected.push({
              name: place.displayName?.text || 'Parking',
              lng: loc.longitude,
              lat: loc.latitude,
              walkMeters: meters,
              walkingBlocks: Math.max(1, Math.round(distMi * 20)),
            });
          }
        }
      } catch { /* non-blocking */ }
    }
    // Mapbox fallback: bbox-bounded so we don't pull hits from the next country.
    if (collected.length === 0) {
      try {
        const pad = 0.01; // ~1.1 km
        const bbox = `${destLng - pad},${destLat - pad},${destLng + pad},${destLat + pad}`;
        const parkUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent('parking')}.json?proximity=${destLng},${destLat}&bbox=${bbox}&limit=8&access_token=${MAPBOX_TOKEN}`;
        const parkRes = await fetch(parkUrl);
        if (parkRes.ok) {
          const parkData = await parkRes.json();
          for (const feat of parkData.features || []) {
            const [pLng, pLat] = feat.center as [number, number];
            const distMi = haversineMiles(destLat, destLng, pLat, pLng);
            if (distMi > 0.62) continue; // double-check; bbox can still leak
            const meters = Math.round(distMi * 1609.34);
            collected.push({
              name: feat.text || feat.place_name || 'Parking',
              lng: pLng,
              lat: pLat,
              walkMeters: meters,
              walkingBlocks: Math.max(1, Math.round(distMi * 20)),
            });
          }
        }
      } catch { /* non-blocking */ }
    }
    // Sort by walking distance, take top 3.
    parkingOptions = collected.sort((a, b) => a.walkMeters - b.walkMeters).slice(0, 3);
    if (parkingOptions.length > 0) {
      const closest = parkingOptions[0];
      // Use meters for metric locales (DE), feet for US/UK.
      const isMetric = lang === 'de';
      const distLabel = isMetric
        ? `${closest.walkMeters} m`
        : `${Math.round(closest.walkMeters * 3.28084)} ft`;
      parkingNote = lang === 'de'
        ? `Achtung, das Parken ist dort schwierig. Ich habe ${parkingOptions.length} Option${parkingOptions.length === 1 ? '' : 'en'} markiert — am nächsten ist ${closest.name}, etwa ${distLabel} zu Fuß.`
        : `Heads up, parking there is tough. I marked ${parkingOptions.length} nearby option${parkingOptions.length === 1 ? '' : 's'} — closest is ${closest.name}, about ${distLabel} walk.`;
    }
  }

  // Route-to-parking: when driver said "park me there", swap the route
  // destination to the closest parking lot. Keeps the original venue name
  // for context but the geometry/coords drop them at parking instead.
  let parkingReroutedNote = '';
  let parkingDropoff: { lng: number; lat: number; name: string } | null = null;
  if (routePreferences.routeToParking && parkingOptions.length > 0) {
    const lot = parkingOptions[0];
    try {
      const reCoords = isRoundTrip
        ? `${body.origin.lng},${body.origin.lat};${lot.lng},${lot.lat};${body.origin.lng},${body.origin.lat}`
        : `${body.origin.lng},${body.origin.lat};${lot.lng},${lot.lat}`;
      const reUrl = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${reCoords}?geometries=geojson&overview=full&steps=true&annotations=maxspeed&voice_instructions=true&voice_units=imperial&banner_instructions=true&language=en${excludeParam}&access_token=${MAPBOX_TOKEN}`;
      const reRes = await fetch(reUrl);
      if (reRes.ok) {
        const reData = await reRes.json();
        const newRoute = reData.routes?.[0];
        if (newRoute) {
          Object.assign(route, newRoute);
          milesNum = newRoute.distance / 1609.34;
          miles = milesNum.toFixed(1);
          minutes = Math.max(1, Math.round(newRoute.duration / 60));
          parkingDropoff = { lng: lot.lng, lat: lot.lat, name: lot.name };
          parkingReroutedNote = lang === 'de'
            ? `Routenziel auf ${lot.name} (Parkplatz) geändert.`
            : `Routed to ${lot.name} (parking) instead of the venue.`;
        }
      }
    } catch { /* non-blocking */ }
  }

  // Prefer Claude's conversational reply; fall back to the deterministic summary.
  // If we picked a Google Places match, lead with its name + rating so the
  // driver hears the actual place rather than Claude's generic 'a coffee shop'.
  const isDe = lang === 'de';
  const distanceUnit = isDe ? 'km' : 'miles';
  const minutesWord = isDe ? 'Minuten' : 'minutes';
  const roundTripWord = isDe ? ' Hin- und Rückfahrt' : ' round trip';
  const milesDisplay = isDe ? (Number(miles) * 1.60934).toFixed(1) : miles;
  // Use Google's openNow flag to flag closed venues up front — driver should
  // know before getting there. Closed wins over rating in the spoken line.
  const closedSuffix = isDe ? ' (zurzeit geschlossen)' : ' (currently closed)';
  const localSearchPrefix = localSearchPick
    ? (() => {
        const nameLine = isDe ? `Gefunden: ${localSearchPick.placeName}` : `Found ${localSearchPick.placeName}`;
        const ratingLine = typeof localSearchPick.rating === 'number'
          ? (isDe ? ` — Bewertung ${localSearchPick.rating.toFixed(1)} Sterne` : ` — rated ${localSearchPick.rating.toFixed(1)} stars`)
          : '';
        const closedLine = localSearchPick.openNow === false ? closedSuffix : '';
        return `${nameLine}${ratingLine}${closedLine}.`;
      })()
    : '';
  const stopLine = intermediateStopResult
    ? (() => {
        const namePart = isDe
          ? `Zwischenstopp eingebaut bei ${intermediateStopResult.name}`
          : `Built in a stop at ${intermediateStopResult.name}`;
        const ratingPart = intermediateStopResult.rating
          ? (isDe ? `, Bewertung ${intermediateStopResult.rating.toFixed(1)}` : `, rated ${intermediateStopResult.rating.toFixed(1)}`)
          : '';
        const distPart = isDe
          ? `, etwa ${(intermediateStopResult.milesIn * 1.60934).toFixed(0)} km voraus`
          : `, about ${intermediateStopResult.milesIn} miles in`;
        const closedPart = intermediateStopResult.openNow === false ? closedSuffix : '';
        return `${namePart}${ratingPart}${distPart}${closedPart}.`;
      })()
    : '';
  const tripLine = `${milesDisplay} ${distanceUnit}${isRoundTrip ? roundTripWord : ''}, ${isDe ? 'etwa' : 'about'} ${minutes} ${minutesWord}.`;
  const baseReply = localSearchPrefix
    ? `${localSearchPrefix} ${tripLine}`
    : (spokenReply
      ? `${spokenReply} ${tripLine}`
      : summary);
  const fuelLineSpoken = fuelNeeded
    ? (isDe
      ? (fuelNeeded.tankPercent != null
        ? `Verbrauch etwa ${(fuelNeeded.gallons * 3.785).toFixed(1)} Liter — ungefähr ${fuelNeeded.tankPercent}% deines Tanks.`
        : `Verbrauch etwa ${(fuelNeeded.gallons * 3.785).toFixed(1)} Liter.`)
      : (fuelNeeded.tankPercent != null
        ? `That'll use about ${fuelNeeded.gallons} gallons — roughly ${fuelNeeded.tankPercent}% of your tank.`
        : `That'll use about ${fuelNeeded.gallons} gallons.`))
    : '';
  const parts = [baseReply];
  if (stopLine) parts.push(stopLine);
  if (fuelLineSpoken) parts.push(fuelLineSpoken);
  if (fuelWarning) parts.push(fuelWarning);
  if (cameraAvoidanceNote) parts.push(cameraAvoidanceNote);
  if (parkingReroutedNote) parts.push(parkingReroutedNote);
  else if (parkingNote) parts.push(parkingNote);
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
    intermediateStop: intermediateStopResult,
    preferenceUpdate: preferenceUpdate || undefined,
    // Only present when we fetched cameras server-side for avoidance scoring;
    // client falls back to its own /api/drive/cameras call otherwise.
    routeCameras: routeCameras.length > 0 ? routeCameras : undefined,
    parkingDropoff: parkingDropoff || undefined,
  });
}
