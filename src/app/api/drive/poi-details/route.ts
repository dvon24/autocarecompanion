import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { knownIssuesLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export const maxDuration = 15;

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/**
 * Generate a brief AI-written description for a POI the user tapped on the
 * map. Mapbox gives us the name + coords; we ask Claude for one sentence
 * of context plus 1-3 short tags so the popup feels like Google/TripAdvisor
 * minus the live data (hours/photos/reviews require a paid Places API,
 * tracked under task #59 for the premium tier).
 *
 * Reverse-geocodes the coords first so Claude knows the city/region.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = knownIssuesLimiter.check(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  if (!ANTHROPIC_KEY) {
    return NextResponse.json({ description: '', tags: [] });
  }

  let body: { name?: string; lng?: number; lat?: number; language?: 'en' | 'de' };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }); }

  const name = (body.name || '').trim();
  if (!name) return NextResponse.json({ description: '', tags: [] });

  // Reverse-geocode for region context (single Mapbox call, cheap).
  let regionLine = '';
  if (typeof body.lng === 'number' && typeof body.lat === 'number' && MAPBOX_TOKEN) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${body.lng},${body.lat}.json?types=place,locality,region,country&limit=1&language=en&access_token=${MAPBOX_TOKEN}`;
      const r = await fetch(url);
      if (r.ok) {
        const d = await r.json();
        regionLine = d.features?.[0]?.place_name || '';
      }
    } catch { /* non-blocking */ }
  }

  const lang = body.language === 'de' ? 'de' : 'en';
  const langDirective = lang === 'de'
    ? 'Antworte auf Deutsch.'
    : 'Reply in English.';

  const prompt = `Give a brief one-or-two-sentence description of this place plus 1–3 short tags. ${langDirective}

Place name: ${name}
${regionLine ? `Located in/near: ${regionLine}` : ''}

Use your training knowledge. If you don't know this specific place, infer from the name what kind of place it likely is and reply with a generic but useful blurb (e.g. "appears to be a local restaurant — could be a great quick stop").

Return ONLY JSON in this shape (no markdown):
{
  "description": "<one or two short sentences a driver would find useful>",
  "tags": ["<tag1>", "<tag2>"],
  "knownConfidence": "high" | "medium" | "low"
}`;

  try {
    const client = new Anthropic({ apiKey: ANTHROPIC_KEY });
    const res = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: 'You write concise, useful one-line descriptions of places for a car driver. Keep it factual, never invent specific operating hours or prices. Return only JSON.',
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = res.content?.[0]?.type === 'text' ? res.content[0].text : '{}';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let parsed: { description?: string; tags?: string[]; knownConfidence?: string } = {};
    try { parsed = JSON.parse(cleaned); }
    catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }
    return NextResponse.json({
      description: String(parsed.description || '').trim().slice(0, 280),
      tags: Array.isArray(parsed.tags) ? parsed.tags.filter((t) => typeof t === 'string').slice(0, 3) : [],
      knownConfidence: parsed.knownConfidence || 'medium',
    });
  } catch (err) {
    console.error('[drive/poi-details] error:', err);
    return NextResponse.json({ description: '', tags: [] });
  }
}
