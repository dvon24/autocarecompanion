import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hubChatMinuteLimiter, getClientIp } from '@/lib/rate-limit';
import { checkAiGate, isAiGateBlocked } from '@/lib/ai-gate';
import { getVehicleSpecs } from '@/lib/maintenance';
import { attachVendorLinks, searchFallbackUrl } from '@/lib/vendor-resolver';
import { validateAndFixVendorLinks } from '@/lib/vendor-link-validator';
import { refineRegion, promptToBox, samEnabled, type SamPrompt, type SamBox } from '@/lib/sam';
import type { IdentifiedPart, PartCategory } from '@/types/vision';

export const maxDuration = 30;
export const runtime = 'nodejs';

/**
 * POST /api/vision/identify — the "tap/box to identify a part" endpoint.
 *
 * The WHAT + WHICH stages of the three-stage vision engine. Given a TIGHT
 * CROP of one component (the region the user tapped/boxed on their photo,
 * cropped client-side) plus the vehicle, it:
 *   1. Loads the CANDIDATE PARTS for this exact YMMT (known issues +
 *      cached verified parts + specs) — the catalog that grounds the
 *      answer so the model MATCHES a real part instead of inventing a
 *      (wrong-era) part number.
 *   2. Runs one gpt-5.5 vision call on the CROP alone (region-constrained
 *      = far more accurate + consistent than reasoning over the whole
 *      cluttered frame).
 *   3. Resolves vendor buy-links via the deterministic vendor-resolver.
 *
 * Consistency: the crop is small and the answer is pinned to a discrete
 * catalog entry, so two taps on different spots of the SAME part resolve
 * to the SAME identified part. See src/lib/sam.ts for the WHERE stage.
 *
 * Gating: open to everyone (this is a cheap sub-action on a photo the
 * user already has on screen — the magic that sells the upsell), but
 * burst-limited per IP. It does NOT consume a photo-diagnosis credit.
 *
 * Request JSON:
 *   {
 *     imageDataUrl: string,          // a CROP (data URL) the client made
 *     fullImageDataUrl?: string,     // optional full frame — only used to
 *                                    //   let a live SAM endpoint refine the
 *                                    //   region server-side (dark by default)
 *     prompt?: SamPrompt,            // the raw point/box selection (percent)
 *     box?: SamBox,                  // where the crop came from (echo/logging)
 *     vehicle?: { year, make, model, trim }
 *   }
 */

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/responses';
const MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-5.5';

interface VehicleCtx {
  year: number;
  make: string;
  model: string;
  trim?: string;
}

// Runtime-validatable set of the PartCategory union from types/vision.ts.
const VALID_CATEGORIES = new Set<PartCategory>([
  'rotor', 'brake_pad', 'caliper', 'tire', 'wheel', 'lug_nut', 'tpms',
  'filter', 'fluid', 'wiper', 'bulb', 'battery', 'spark_plug', 'sensor',
  'belt', 'hose', 'suspension', 'ignition', 'fuel_pump', 'alternator',
  'starter', 'body_panel', 'trim', 'badge', 'emblem', 'bracket',
  'interior', 'accessory', 'tool', 'oem_specific', 'other',
]);

export async function POST(request: NextRequest) {
  if (!OPENAI_KEY) {
    return NextResponse.json({ error: 'not_configured', message: 'Identify is not configured.' }, { status: 503 });
  }

  // Burst protection (shared limiter with the other vision surfaces).
  const ip = getClientIp(request);
  if (!hubChatMinuteLimiter.check(ip).success) {
    return NextResponse.json(
      { error: 'rate_limited', message: "One moment — you're tapping very fast. Try again in a few seconds." },
      { status: 429 },
    );
  }

  // GDPR Art. 21 right-to-object: a signed-in user who toggled the AI
  // opt-out short-circuits here — no image ever reaches OpenAI. Anon
  // users pass through (nothing to look up). Same helper the hub-chat +
  // vision routes use.
  const gate = await checkAiGate();
  if (isAiGateBlocked(gate)) return gate;

  let body: {
    imageDataUrl?: string;
    fullImageDataUrl?: string;
    prompt?: SamPrompt;
    box?: SamBox;
    vehicle?: Partial<VehicleCtx>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad_request', message: 'Invalid request body.' }, { status: 400 });
  }

  const imageDataUrl = typeof body.imageDataUrl === 'string' ? body.imageDataUrl : '';
  if (!imageDataUrl.startsWith('data:image/')) {
    return NextResponse.json({ error: 'bad_request', message: 'A cropped image is required.' }, { status: 400 });
  }

  const vehicle: VehicleCtx | null =
    body.vehicle && body.vehicle.make && body.vehicle.model && body.vehicle.year
      ? {
          year: Number(body.vehicle.year),
          make: String(body.vehicle.make),
          model: String(body.vehicle.model),
          trim: body.vehicle.trim ? String(body.vehicle.trim) : undefined,
        }
      : null;

  // ─── WHERE (optional, dark): let a live SAM endpoint tighten the
  // region. Inert unless SAM_ENDPOINT_URL is set; on null we just echo
  // the client's box. We do NOT re-crop server-side (no image lib on the
  // hot path) — the client already sent a tight crop; SAM's refined box
  // is returned to the client so a future in-browser path can re-crop.
  let refinedBox: SamBox | null = body.box ?? (body.prompt ? promptToBox(body.prompt) : null);
  let refinedPolygon: Array<{ x: number; y: number }> | null = null;
  if (samEnabled() && body.fullImageDataUrl && body.prompt) {
    try {
      const b64 = body.fullImageDataUrl.split(',')[1] || '';
      const buf = Buffer.from(b64, 'base64');
      const sam = await refineRegion(buf, body.prompt);
      if (sam?.box) refinedBox = sam.box;
      if (sam?.polygon && sam.polygon.length >= 3) refinedPolygon = sam.polygon;
    } catch { /* fail soft — keep the client box, no mask */ }
  }

  // ─── WHICH: load the candidate parts / issues / specs for THIS vehicle.
  let candidateContext = '';
  let issueIdByHint: Array<{ id: string; title: string }> = [];
  // OEM part numbers we can CORROBORATE from our own verified catalog. A
  // model-emitted PN is only trusted enough to build a part-number DEEP link
  // (which soft-404s when wrong) if it appears here; otherwise we downgrade
  // that vendor to a search link.
  const catalogPNs = new Set<string>();
  if (vehicle) {
    try {
      const [issues, cachedParts] = await Promise.all([
        prisma.knownIssue.findMany({
          where: {
            make: { equals: vehicle.make, mode: 'insensitive' },
            model: { equals: vehicle.model, mode: 'insensitive' },
            years: { has: vehicle.year },
            status: 'published',
          },
          select: { id: true, title: true },
          take: 12,
          orderBy: { reportCount: 'desc' },
        }),
        prisma.vehiclePartLookup.findMany({
          where: {
            year: vehicle.year,
            make: { equals: vehicle.make, mode: 'insensitive' },
            model: { equals: vehicle.model, mode: 'insensitive' },
          },
          select: { task: true, parts: true },
          take: 16,
        }),
      ]);
      issueIdByHint = issues;

      const parts: string[] = [];
      for (const cp of cachedParts) {
        const arr = Array.isArray(cp.parts)
          ? (cp.parts as Array<{ brand?: string; partNumber?: string; name?: string }>)
          : [];
        for (const p of arr.slice(0, 2)) {
          if (p.partNumber) catalogPNs.add(String(p.partNumber).toUpperCase().replace(/\s+/g, ''));
          const line = `${p.name || ''}${p.partNumber ? ` — OEM ${p.partNumber}` : ''}${p.brand ? ` (${p.brand})` : ''}`.trim();
          if (line) parts.push(`- ${line}  [for: ${cp.task}]`);
        }
      }

      const blocks: string[] = [];
      if (parts.length) {
        blocks.push(`VERIFIED PARTS CATALOG for this exact vehicle (prefer an exact match from here — these part numbers are known-correct for THIS year/make/model):\n${parts.slice(0, 24).join('\n')}`);
      }
      if (issues.length) {
        blocks.push(`KNOWN ISSUES for this vehicle (if the tapped part is the subject of one, set relatedKnownIssueId to its id):\n${issues.map(i => `- ${i.title} (id: ${i.id})`).join('\n')}`);
      }
      const specs = getVehicleSpecs(vehicle);
      if (specs) {
        const s: string[] = [];
        if (specs.engine) s.push(`Engine: ${specs.engine}`);
        if (specs.oil) s.push(`Oil filter: ${specs.oil.filterPartNumber}`);
        if (specs.lug) s.push(`Lug: ${specs.lug.size} ${specs.lug.useBolts ? 'bolts' : 'nuts'}`);
        if (specs.coolant?.type) s.push(`Coolant: ${specs.coolant.type}`);
        if (specs.brakeFluid?.type) s.push(`Brake fluid: ${specs.brakeFluid.type}`);
        if (s.length) blocks.push(`VEHICLE SPECS:\n${s.join('\n')}`);
      }
      if (blocks.length) candidateContext = '\n\n' + blocks.join('\n\n');
    } catch { /* non-blocking — identify still works context-free */ }
  }

  const vehicleDesc = vehicle
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}`
    : 'an unknown vehicle';

  const SYSTEM_PROMPT = `You are an expert automotive parts technician. The user tapped a spot on a photo; the vehicle in their garage is ${vehicleDesc}, but the photo may be of a DIFFERENT vehicle. You are shown a TIGHT CROP centered on the ONE component they pointed at. Identify that single component and nothing else in the frame.${candidateContext}

READ THE IMAGE FIRST — this overrides everything:
- Look for any visible TEXT, BADGE, LOGO, or MODEL NAME in the crop (e.g. a word stamped on a steering wheel, an emblem, a casting mark).
- If what you see CONTRADICTS the garage vehicle "${vehicleDesc}" (e.g. the wheel says "Camaro" but the garage says Challenger), TRUST THE IMAGE. Identify the part for the vehicle the IMAGE shows, set vehicleMismatch=true, and say what you saw in vehicleMismatchNote (e.g. "Steering wheel is badged Camaro, not your Challenger"). NEVER force the part to be from ${vehicleDesc} when the image clearly shows another vehicle — that is the worst possible error.
- Only treat the part as belonging to ${vehicleDesc} when nothing visible contradicts it (vehicleMismatch=false).

RULES:
- Identify the ONE main automotive component in the crop. Ignore background, other parts, hands, tools.
- Use the VERIFIED PARTS CATALOG above ONLY to confirm/number a part that genuinely matches what you see — do NOT bend a clearly-branded part to fit the catalog.
- PART NUMBER HONESTY: only put a value in oemPartNumbers/aftermarketPartNumbers if you are genuinely confident it is correct for the vehicle the IMAGE shows. A wrong or wrong-generation part number is worse than none — when unsure, leave the arrays EMPTY and let the search query find it. Never guess a plausible-looking number. If vehicleMismatch=true, leave oemPartNumbers EMPTY unless you are certain.
- WEAR/CONDITION HONESTY: a photo shows appearance, not measurements. DEFAULT condition to "ok" (or "info" for a mere identification like a badge). Only use "warn"/"critical" when a SPECIFIC defect is CLEARLY VISIBLE in the crop, and make "finding" name that visible evidence. Do not invent wear.
- If the crop is not an automotive part (finger, sky, blurry), set category "other", confidence low, and say so in name.
- category MUST be one of: rotor, brake_pad, caliper, tire, wheel, lug_nut, tpms, filter, fluid, wiper, bulb, battery, spark_plug, sensor, belt, hose, suspension, ignition, fuel_pump, alternator, starter, body_panel, trim, badge, emblem, bracket, interior, accessory, tool, oem_specific, other.

Return ONLY a JSON object:
{
  "name": "specific component name, e.g. Front brake rotor (vented)",
  "category": "one of the enum values",
  "spec": "short spec line if visible/known, else \\"\\"",
  "brand": "brand if visible/known, else \\"\\"",
  "oemPartNumbers": ["only if confident, else empty"],
  "aftermarketPartNumbers": [{"brand": "Brembo", "partNumber": "09.C394.11"}],
  "confidence": 0.0,
  "condition": "ok|warn|critical|info",
  "finding": "short visible-condition phrase, or \\"\\" ",
  "vehicleMismatch": false,
  "vehicleMismatchNote": "what the image shows if it differs from ${vehicleDesc}, else \\"\\" ",
  "searchQuery": "the best retailer search string for this exact part on the vehicle the image shows",
  "relatedKnownIssueId": "an id from KNOWN ISSUES above if this part is its subject, else \\"\\" "
}`;

  const openaiBody = {
    model: MODEL,
    reasoning: { effort: 'low' },
    text: { format: { type: 'json_object' } },
    max_output_tokens: 2000,
    input: [
      { role: 'system', content: [{ type: 'input_text', text: SYSTEM_PROMPT }] },
      {
        role: 'user',
        content: [
          { type: 'input_text', text: 'What exact part is this, and where can I buy it for my vehicle?' },
          { type: 'input_image', image_url: imageDataUrl, detail: 'high' },
        ],
      },
    ],
  };

  let data: unknown;
  try {
    const r = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify(openaiBody),
      signal: AbortSignal.timeout(25_000),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      console.error('[identify] OpenAI', r.status, txt.slice(0, 300));
      return NextResponse.json({ error: 'identify_failed', message: 'Could not identify that part. Try tapping again or zooming in.' }, { status: 502 });
    }
    data = await r.json();
  } catch (err) {
    console.error('[identify] fetch failed:', err);
    return NextResponse.json({ error: 'identify_failed', message: 'Identify is temporarily unavailable. Try again in a moment.' }, { status: 502 });
  }

  const content = extractContent(data);
  const parsed = content ? extractJson(content) : null;
  if (!parsed) {
    return NextResponse.json({ error: 'identify_failed', message: 'Could not read the part. Try a tighter tap on the part.' }, { status: 502 });
  }

  // ─── Normalize the model output into an IdentifiedPart + vendor links.
  const rawCategory = String(parsed.category || 'other') as PartCategory;
  const category: PartCategory = VALID_CATEGORIES.has(rawCategory) ? rawCategory : 'other';
  const name = typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : 'Unidentified part';
  const oemPartNumbers = Array.isArray(parsed.oemPartNumbers)
    ? parsed.oemPartNumbers.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).slice(0, 4)
    : [];
  const aftermarketPartNumbers = Array.isArray(parsed.aftermarketPartNumbers)
    ? (parsed.aftermarketPartNumbers as unknown[]).filter(
        (x): x is { brand: string; partNumber: string } =>
          !!x && typeof x === 'object' &&
          typeof (x as { brand?: unknown }).brand === 'string' &&
          typeof (x as { partNumber?: unknown }).partNumber === 'string',
      ).slice(0, 4)
    : [];
  const condition = ['ok', 'warn', 'critical', 'info'].includes(String(parsed.condition))
    ? (parsed.condition as IdentifiedPart['condition'])
    : 'info';
  const confidence = clamp01(Number(parsed.confidence));
  const vehicleMismatch = parsed.vehicleMismatch === true;
  const vehicleMismatchNote = typeof parsed.vehicleMismatchNote === 'string' ? parsed.vehicleMismatchNote.trim() : '';

  const [withLinks] = attachVendorLinks(
    [
      {
        id: 'tap_' + Math.random().toString(36).slice(2, 10),
        role: 'primary',
        category,
        name,
        spec: typeof parsed.spec === 'string' && parsed.spec.trim() ? parsed.spec.trim() : undefined,
        confidence,
        visibleInPhoto: true,
        brand: typeof parsed.brand === 'string' && parsed.brand.trim() ? parsed.brand.trim() : undefined,
        oemPartNumbers,
        aftermarketPartNumbers: aftermarketPartNumbers.length ? aftermarketPartNumbers : undefined,
        condition,
        finding: typeof parsed.finding === 'string' && parsed.finding.trim() ? parsed.finding.trim() : undefined,
        box: refinedBox ? { x: refinedBox.x, y: refinedBox.y, w: refinedBox.w, h: refinedBox.h } : undefined,
        searchQuery: typeof parsed.searchQuery === 'string' ? parsed.searchQuery : undefined,
      },
    ],
    vehicle ?? undefined,
  );

  // Deep-link safety: a part-number PDP link (Mopar/GM Parts Giant, RockAuto)
  // built from an AI-GUESSED OEM number soft-404s (200 status, "no results"
  // page) so the HEAD validator can't catch it. Only trust a PN enough to
  // deep-link it when our own verified catalog corroborates it; otherwise
  // downgrade that vendor to its always-valid search tier. On a vehicle
  // mismatch, nothing is corroborated — everything routes to search.
  const pnTrusted = !vehicleMismatch &&
    oemPartNumbers.some(pn => catalogPNs.has(pn.toUpperCase().replace(/\s+/g, '')));
  if (!pnTrusted) {
    withLinks.vendorLinks = withLinks.vendorLinks.map((l) => {
      if (l.linkType !== 'deep') return l;
      const fb = searchFallbackUrl(l.vendor, {
        category, name, brand: withLinks.brand, oemPartNumbers, spec: withLinks.spec, searchQuery: l.searchQuery,
      });
      return fb ? { ...l, url: fb, linkType: 'search' as const } : l;
    });
  }

  const part = await safeValidate(withLinks);

  const relatedId = typeof parsed.relatedKnownIssueId === 'string' ? parsed.relatedKnownIssueId.trim() : '';
  const relatedIssue = relatedId ? issueIdByHint.find(i => i.id === relatedId) || null : null;

  return NextResponse.json({
    ok: true,
    part,
    box: refinedBox,
    polygon: refinedPolygon, // full-image PERCENT points; null when SAM off/failed
    samRefined: !!refinedPolygon,
    vehicleMismatch,
    vehicleMismatchNote: vehicleMismatch ? vehicleMismatchNote : '',
    relatedIssue: relatedIssue ? { id: relatedIssue.id, title: relatedIssue.title } : null,
  });
}

// ─── helpers ─────────────────────────────────────────────────────────

async function safeValidate(part: IdentifiedPart): Promise<IdentifiedPart> {
  try {
    const fixed = await validateAndFixVendorLinks([part]);
    return fixed[0] || part;
  } catch {
    return part;
  }
}

function clamp01(n: number): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

function extractContent(data: unknown): string {
  const d = data as {
    output_text?: string;
    output?: Array<{ type?: string; content?: Array<{ text?: string }> }>;
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (d?.output_text) return d.output_text;
  if (Array.isArray(d?.output)) {
    for (const item of d.output) {
      if (item?.type === 'message' && Array.isArray(item.content)) {
        for (const c of item.content) {
          if (typeof c?.text === 'string' && c.text.length) return c.text;
        }
      }
    }
  }
  if (d?.choices?.[0]?.message?.content) return d.choices[0].message.content;
  return '';
}

function extractJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  const candidate = fence ? fence[1].trim() : trimmed;
  try { return JSON.parse(candidate) as Record<string, unknown>; } catch { /* balance below */ }
  const start = candidate.indexOf('{');
  if (start < 0) return null;
  let depth = 0, inStr = false, escape = false;
  for (let i = start; i < candidate.length; i++) {
    const c = candidate[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) {
      try { return JSON.parse(candidate.slice(start, i + 1)) as Record<string, unknown>; } catch { return null; }
    } }
  }
  return null;
}
