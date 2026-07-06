import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * POST /api/drive/briefing — the "get in the car" briefing.
 *
 * The client picks the driver's USUAL destination for this time of day (from
 * local route history) and passes it here with the typical duration. We geocode
 * it, pull a LIVE traffic-aware ETA from Mapbox driving-traffic, compare it to
 * the typical time, and return a natural one-line briefing the copilot speaks:
 *   "Morning — your usual run to the office. Traffic's light, about 22 minutes."
 *   "Heads up — the drive to Home is heavy right now, ~34 min vs your usual 22."
 *
 * Live traffic comes from the SAME Mapbox driving-traffic profile the routing
 * already uses (no Waze/Google needed). Named incidents ("an accident") are a
 * future add-on (TomTom) — this returns the level + delta, not the cause.
 */
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Body {
  origin?: { lng: number; lat: number };
  destination?: string;
  typicalMin?: number;
  greetWord?: string; // 'Morning' | 'Afternoon' | 'Evening' (client, local time)
  lang?: 'en' | 'de';
}

export async function POST(request: NextRequest) {
  if (!MAPBOX_TOKEN) return NextResponse.json({ ok: false, reason: 'not_configured' });
  let body: Body;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 }); }
  const o = body.origin;
  const destination = (body.destination || '').trim();
  const typicalMin = Number(body.typicalMin) || null;
  const lang = body.lang === 'de' ? 'de' : 'en';
  const greet = (body.greetWord || '').trim();
  if (!o || typeof o.lng !== 'number' || typeof o.lat !== 'number' || !destination) {
    return NextResponse.json({ ok: false, reason: 'missing_params' }, { status: 400 });
  }

  try {
    // Geocode the usual destination near the driver.
    const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?proximity=${o.lng},${o.lat}&limit=1&language=${lang}&access_token=${MAPBOX_TOKEN}`;
    const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(8000) });
    if (!geoRes.ok) return NextResponse.json({ ok: false, reason: 'geocode_failed' });
    const geo = await geoRes.json();
    const feat = geo?.features?.[0];
    const center = feat?.center as [number, number] | undefined;
    if (!center) return NextResponse.json({ ok: false, reason: 'no_destination' });
    const coords = { lng: center[0], lat: center[1] };
    const placeName = feat.place_name || destination;

    // Live traffic-aware ETA (same profile as the router).
    const dirUrl = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${o.lng},${o.lat};${coords.lng},${coords.lat}?overview=false&access_token=${MAPBOX_TOKEN}`;
    const dirRes = await fetch(dirUrl, { signal: AbortSignal.timeout(8000) });
    if (!dirRes.ok) return NextResponse.json({ ok: false, reason: 'directions_failed' });
    const dir = await dirRes.json();
    const route = dir?.routes?.[0];
    if (!route) return NextResponse.json({ ok: false, reason: 'no_route' });
    const liveMin = Math.round(route.duration / 60);
    const miles = Math.round((route.distance / 1609.34) * 10) / 10;

    // Traffic level vs the driver's typical time for this run.
    let level: 'light' | 'normal' | 'heavy' = 'normal';
    if (typicalMin && typicalMin > 0) {
      const ratio = liveMin / typicalMin;
      if (ratio <= 0.95) level = 'light';
      else if (ratio >= 1.2) level = 'heavy';
    }

    // Destination weather (Open-Meteo — free, no key) + a what-to-pack hint.
    // Something maps don't do: "it's rainy at the office, grab a jacket."
    const weather = await fetchWeather(coords.lat, coords.lng, lang);

    const shortDest = placeName.split(',')[0];
    const line = buildLine(lang, greet, shortDest, liveMin, typicalMin, level, weather);
    return NextResponse.json({ ok: true, destination: shortDest, placeName, coords, liveMin, typicalMin, miles, level, weather, line });
  } catch {
    return NextResponse.json({ ok: false, reason: 'network' });
  }
}

interface Weather { tempLabel: string; condition: string; packHint: string }

// WMO weather-code → plain condition + a what-to-pack cue.
async function fetchWeather(lat: number, lng: number, lang: 'en' | 'de'): Promise<Weather | null> {
  try {
    const unit = lang === 'de' ? 'celsius' : 'fahrenheit';
    const wind = lang === 'de' ? 'kmh' : 'mph';
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&temperature_unit=${unit}&wind_speed_unit=${wind}&timezone=auto`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const j = await res.json();
    const c = j?.current;
    if (!c) return null;
    const temp = Math.round(c.temperature_2m);
    const code = Number(c.weather_code);
    const precip = Number(c.precipitation) || 0;
    const isDe = lang === 'de';
    const cond = codeToCondition(code, isDe);
    const degF = lang !== 'de';
    const cold = degF ? temp <= 50 : temp <= 10;
    const hot = degF ? temp >= 85 : temp >= 30;
    const rain = precip > 0 || (code >= 51 && code <= 82);
    const snow = (code >= 71 && code <= 77) || code === 85 || code === 86;
    let packHint = '';
    if (snow) packHint = isDe ? 'zieh dich warm an, es könnte glatt sein' : 'bundle up, roads may be slick';
    else if (rain) packHint = isDe ? 'nimm einen Regenschirm mit' : 'grab an umbrella';
    else if (cold) packHint = isDe ? 'nimm eine Jacke mit' : 'grab a jacket';
    else if (hot) packHint = isDe ? 'nimm Wasser mit, es ist heiß' : 'bring water, it\'s hot out';
    return { tempLabel: `${temp}°`, condition: cond, packHint };
  } catch { return null; }
}

function codeToCondition(code: number, de: boolean): string {
  if (code === 0) return de ? 'klar' : 'clear';
  if (code <= 3) return de ? 'bewölkt' : 'cloudy';
  if (code === 45 || code === 48) return de ? 'neblig' : 'foggy';
  if (code >= 51 && code <= 67) return de ? 'regnerisch' : 'rainy';
  if (code >= 71 && code <= 77) return de ? 'schneit' : 'snowy';
  if (code >= 80 && code <= 82) return de ? 'Regenschauer' : 'rainy';
  if (code >= 85 && code <= 86) return de ? 'Schneeschauer' : 'snowy';
  if (code >= 95) return de ? 'Gewitter' : 'stormy';
  return de ? 'bewölkt' : 'mild';
}

function buildLine(lang: 'en' | 'de', greet: string, dest: string, liveMin: number, typicalMin: number | null, level: 'light' | 'normal' | 'heavy', weather: Weather | null): string {
  const g = greet ? `${greet} — ` : '';
  const w = weather ? (lang === 'de'
    ? ` In ${dest} ist es ${weather.tempLabel} und ${weather.condition}${weather.packHint ? ` — ${weather.packHint}` : ''}.`
    : ` It's ${weather.tempLabel} and ${weather.condition} at ${dest}${weather.packHint ? ` — ${weather.packHint}` : ''}.`) : '';
  let traffic: string;
  if (lang === 'de') {
    if (level === 'heavy') traffic = `${g}die Fahrt nach ${dest} ist gerade zäh, etwa ${liveMin} Minuten${typicalMin ? ` statt sonst ${typicalMin}` : ''}.`;
    else if (level === 'light') traffic = `${g}deine übliche Fahrt nach ${dest}. Wenig Verkehr, etwa ${liveMin} Minuten.`;
    else traffic = `${g}deine übliche Fahrt nach ${dest} — etwa ${liveMin} Minuten, normal für diese Zeit.`;
  } else {
    if (level === 'heavy') traffic = `${g}the run to ${dest} is heavy right now — about ${liveMin} minutes${typicalMin ? ` versus your usual ${typicalMin}` : ''}.`;
    else if (level === 'light') traffic = `${g}your usual run to ${dest}. Traffic's light, about ${liveMin} minutes.`;
    else traffic = `${g}your usual drive to ${dest} — about ${liveMin} minutes, normal for this time.`;
  }
  return traffic + w;
}
