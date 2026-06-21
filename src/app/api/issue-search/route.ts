import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/rate-limit';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * POST /api/issue-search — natural-language issue matcher for a single model's
 * known-issues page. The user describes their problem in their own words; an
 * LLM matches it (by MEANING, not keywords) against the issues already on the
 * page and returns the best matches RANKED with a confidence — or an explicit
 * "no match."
 *
 * Design goals (Devon: "one mismatch and we lose the user"):
 *   - PRECISION over recall: it is told to return noMatch rather than force a
 *     weak guess. The client gates on confidence and, below the bar, hands off
 *     to the AI diagnose instead of showing a wrong card.
 *   - Zero Supabase load: the candidate issues are passed in from the page
 *     (already SSR'd), so this never touches the DB. OpenAI only.
 *   - Only runs on a real user search (POST), never on a crawl.
 */

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_SEARCH_MODEL || 'gpt-4.1-mini';

type Candidate = { id: string; title: string; symptoms?: string[]; dtcCodes?: string[] };

// Light in-memory burst limiter (per IP) — search is a user action, but keep a
// ceiling so it can't be hammered. 20 / 20s.
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 20_000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 20;
}

export async function POST(req: NextRequest) {
  if (!OPENAI_KEY) return NextResponse.json({ matches: [], noMatch: true, message: 'Search offline.' }, { status: 200 });
  if (limited(getClientIp(req))) return NextResponse.json({ matches: [], noMatch: true, message: 'Slow down a moment.' }, { status: 429 });

  // PLUS feature: AI natural-language search is gated to paying subscribers
  // (Plus + Pro). Free users get the client-side fuzzy search instead. The
  // active-status flag rides in the session JWT, so no DB hit here.
  let session;
  try { session = await auth(); } catch { session = null; }
  const isSubscriber = !!session?.user && (session.user as { subscriptionStatus?: string }).subscriptionStatus === 'active';
  if (!isSubscriber) {
    return NextResponse.json({
      gated: true,
      matches: [],
      message: 'AI search understands plain-English descriptions — a Plus feature.',
      ctaUrl: '/subscribe',
      ctaLabel: 'Upgrade to Plus',
    }, { status: 402 });
  }

  let body: { query?: string; make?: string; model?: string; issues?: Candidate[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad_json' }, { status: 400 }); }

  const query = String(body.query || '').trim().slice(0, 400);
  const make = String(body.make || '').slice(0, 40);
  const model = String(body.model || '').slice(0, 60);
  const issues = Array.isArray(body.issues) ? body.issues.slice(0, 120) : [];
  if (query.length < 2 || issues.length === 0) return NextResponse.json({ matches: [], noMatch: true });

  // Compact candidate list for the prompt (id + title + a few symptoms + DTCs).
  const list = issues.map((c, i) => {
    const sym = Array.isArray(c.symptoms) ? c.symptoms.slice(0, 4).join('; ') : '';
    const dtc = Array.isArray(c.dtcCodes) ? c.dtcCodes.slice(0, 6).join(',') : '';
    return `${i}\t${c.title}${sym ? ` | symptoms: ${sym}` : ''}${dtc ? ` | codes: ${dtc}` : ''}`;
  }).join('\n');

  const sys = [
    `A ${make} ${model} owner is describing a problem in their own words. Match their description, by MEANING (not just shared keywords), to the most likely issues from the numbered list.`,
    'Return up to 3 candidate indices ranked most-likely first, each with a confidence 0-1 for how well it matches.',
    'BE STRICT. If nothing in the list genuinely matches their description, return an empty list (noMatch). A wrong match is worse than no match. Do not force a guess.',
    'A 5-digit/alphanumeric trouble code (e.g. P0420) or an exact part/symptom phrase should match the issue carrying it with high confidence.',
  ].join(' ');

  const schema = {
    type: 'object', additionalProperties: false, required: ['matches'],
    properties: { matches: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['index', 'confidence'], properties: { index: { type: 'integer' }, confidence: { type: 'number' } } } } },
  };

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: `Description: "${query}"\n\nISSUES (index<TAB>title | symptoms | codes):\n${list}` },
        ],
        response_format: { type: 'json_schema', json_schema: { name: 'issue_matches', strict: true, schema } },
        max_completion_tokens: 300,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      console.warn('[issue-search] openai', r.status, t.slice(0, 200));
      return NextResponse.json({ matches: [], noMatch: true });
    }
    const data = await r.json();
    let parsed: { matches?: Array<{ index: number; confidence: number }> } = {};
    try { parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}'); } catch { /* */ }
    const raw = Array.isArray(parsed.matches) ? parsed.matches : [];
    const matches = raw
      .filter((m) => Number.isInteger(m.index) && m.index >= 0 && m.index < issues.length)
      .slice(0, 3)
      .map((m) => ({ id: issues[m.index].id, confidence: Math.max(0, Math.min(1, Number(m.confidence) || 0)) }));
    const top = matches[0]?.confidence ?? 0;
    return NextResponse.json({ matches, noMatch: matches.length === 0, topConfidence: top });
  } catch (e) {
    console.warn('[issue-search] error', e instanceof Error ? e.message : e);
    return NextResponse.json({ matches: [], noMatch: true });
  }
}
