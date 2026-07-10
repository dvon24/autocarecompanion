import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hubChatMinuteLimiter, getClientIp } from '@/lib/rate-limit';
import { checkAiGate, isAiGateBlocked } from '@/lib/ai-gate';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';
import { getVehicleSpecs } from '@/lib/maintenance';
import { attachVendorLinks, searchFallbackUrl } from '@/lib/vendor-resolver';
import { validateAndFixVendorLinks } from '@/lib/vendor-link-validator';
import { refineRegion, promptToBox, samEnabled, type SamPrompt, type SamBox } from '@/lib/sam';
import { webDetect, googleVisionEnabled, webDetectPromptBlock } from '@/lib/google-vision';
import { ebayEnabled, resolveEbay } from '@/lib/ebay-resolver';
import { buildUpgradeOptions } from '@/lib/aftermarket-tier';
import { ebayAffiliate } from '@/lib/ebay-affiliate';
import type { IdentifiedPart, PartCategory, IssuePart } from '@/types/vision';
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';

export const maxDuration = 45; // headroom for an occasional web-search grounding pass
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

// Identify model is provider-switchable via IDENTIFY_MODEL:
//   'gpt-5.5' (default, OpenAI)  |  'claude-fable-5' / any claude-* (Anthropic)
// Flip the Vercel env var to A/B without a code change. A model string
// containing 'claude' or 'fable' routes to Anthropic; anything else → OpenAI.
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/responses';
const IDENTIFY_MODEL = process.env.IDENTIFY_MODEL || 'gpt-5.5';
const USE_ANTHROPIC = /claude|fable/i.test(IDENTIFY_MODEL);
// Web-search grounding: Fable 5 may search the web to VERIFY a part / part
// number when it can't determine it confidently from the image + catalog.
// ON by default; set IDENTIFY_WEB_SEARCH=off to disable without a deploy. The
// prompt tells it to search ONLY when unsure, so easy taps stay fast + free.
const WEB_SEARCH = process.env.IDENTIFY_WEB_SEARCH !== 'off';
const WEB_SEARCH_RULE = `

WEB SEARCH: You have a web_search tool. Use it ONLY when you cannot confidently determine the exact part OR its correct OEM part number for this specific vehicle from the image + the catalog above (e.g. to verify a part number, or to pin down an unusual/badged part). For parts you already recognize with confidence, answer directly WITHOUT searching. Never search more than necessary. After any search, still reply with ONLY the JSON object.`;

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
  if (USE_ANTHROPIC ? !ANTHROPIC_KEY : !OPENAI_KEY) {
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

  // Founder-only pipeline trace: when a founder taps, the response echoes the
  // full Stage 1-4 decision trail (model output, catalog grounding, eBay resolve,
  // per-vendor link build) so "why did it link there" is always inspectable.
  let isFounder = false;
  try { const s = await auth(); isFounder = isFounderEmail(s?.user?.email); } catch { /* anon */ }

  let body: {
    imageDataUrl?: string;
    fullImageDataUrl?: string;
    prompt?: SamPrompt;
    box?: SamBox;
    vehicle?: Partial<VehicleCtx>;
    queryHint?: string;
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

  // Spoken/typed disambiguation hint. When the user asked the voice mechanic
  // "show me the brake rotor", we freeze the center of the frame — but the crop
  // may contain several parts. This hint tells the model WHICH part they meant,
  // so the identify (and thus the search + buy links) reflects what they asked
  // for, not just whatever happened to be centered. Length-capped; sanitized.
  const queryHint = typeof body.queryHint === 'string'
    ? body.queryHint.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
    : '';

  const vehicle: VehicleCtx | null =
    body.vehicle && body.vehicle.make && body.vehicle.model && body.vehicle.year
      ? {
          year: Number(body.vehicle.year),
          make: String(body.vehicle.make),
          model: String(body.vehicle.model),
          trim: body.vehicle.trim ? String(body.vehicle.trim) : undefined,
        }
      : null;

  // ─── WHERE: let the live SAM endpoint tighten the region to the actual
  // object mask. When it does, we RE-CROP the full frame to that mask (via
  // sharp) and feed the model THAT tight crop instead of the loose client
  // square — the model sees just the part, which is the biggest lever
  // against "guessing" on cluttered shots. Falls back to the client crop
  // when SAM is off/failed.
  let refinedBox: SamBox | null = body.box ?? (body.prompt ? promptToBox(body.prompt) : null);
  let refinedPolygon: Array<{ x: number; y: number }> | null = null;
  let vlmImageDataUrl = imageDataUrl; // what the model actually sees
  if (samEnabled() && body.fullImageDataUrl && body.prompt) {
    try {
      const b64 = body.fullImageDataUrl.split(',')[1] || '';
      const buf = Buffer.from(b64, 'base64');
      const sam = await refineRegion(buf, body.prompt);
      if (sam?.box) refinedBox = sam.box;
      if (sam?.polygon && sam.polygon.length >= 3) refinedPolygon = sam.polygon;
      if (sam?.box) {
        const tight = await cropToBox(buf, sam.box, 0.10); // 10% padding
        if (tight) vlmImageDataUrl = tight;
      }
    } catch { /* fail soft — keep the client crop, no mask */ }
  }

  // ─── WHICH: load the candidate parts / issues / specs for THIS vehicle.
  let candidateContext = '';
  let issueIdByHint: Array<{ id: string; title: string }> = [];
  // Matched-issue → its curated fixParts (the top-of-trust buyable list). Kept
  // by issue id so a relatedKnownIssueId match can surface the verified parts.
  const fixPartsById = new Map<string, unknown>();
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
          select: { id: true, title: true, fixParts: true },
          // Load up to 50 (was 12): a tapped part tied to issue #13+ used to
          // silently never match — indistinguishable from "no issue exists".
          // id+title is a few tokens each (<1% of the image cost), so the cap
          // was false economy. 50 covers every real model's published set.
          take: 50,
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
      issueIdByHint = issues.map((i) => ({ id: i.id, title: i.title }));
      for (const it of issues) fixPartsById.set(it.id, it.fixParts);

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

  // When the request carries a spoken/typed hint, tell the model what the user
  // actually asked for so it resolves the RIGHT part in the crop (not just the
  // centered one) — this is what makes the search reflect the voice request.
  const voiceHintBlock = queryHint
    ? `\n\nWHAT THE USER ASKED FOR (spoken): "${queryHint}". The crop is centered where they were pointing, but may contain more than one part. If the component they named IS visible in the crop, identify THAT one. If it is clearly NOT in the crop, identify the main component that is, and note the mismatch in "finding".`
    : '';

  const SYSTEM_PROMPT = `You are an expert automotive parts technician. The user tapped a spot on a photo; the vehicle in their garage is ${vehicleDesc}, but the photo may be of a DIFFERENT vehicle. You are shown a TIGHT CROP centered on the ONE component they pointed at. Identify that single component and nothing else in the frame.${voiceHintBlock}${candidateContext}

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
- DEEP BUY LINK: use web search to find the DEEPEST verified BUY link — a REAL product page for THIS exact part on the ${vehicleDesc} (use the full year + make + model + trim so it fits THIS vehicle). It MUST be a live buyable product page (e.g. a Mopar eStore / MoparPartsGiant / RockAuto / manufacturer product page, or a specific eBay item /itm/ or Amazon /dp/ page). It must NEVER be a search-results page (no Amazon /s?k=, no eBay /sch/, no RockAuto /partsearch/, no google search) and never a homepage. Prefer the most-CORRECT + deepest page regardless of whether it's affiliate. If you cannot confirm a real product page, leave verifiedProductUrl EMPTY (a search link is built automatically). NEVER invent a URL.

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
  "verifiedProductUrl": "a REAL product page URL for this exact part on ${vehicleDesc} found via web search — never a search/homepage, else \\"\\"",
  "verifiedVendor": "the store name for verifiedProductUrl (e.g. \\"Mopar eStore\\", \\"RockAuto\\", \\"eBay\\"), else \\"\\"",
  "relatedKnownIssueId": "an id from KNOWN ISSUES above if this part is its subject, else \\"\\" "
}`;

  // ─── WHAT: Fable 5 vision on the tight crop. Fable 5 = adaptive-thinking
  // family: no temperature/top_p, and we omit the thinking param entirely
  // (identify is a fast structured read; add adaptive later if it needs it).
  const img = parseDataUrl(vlmImageDataUrl);
  if (!img) {
    return NextResponse.json({ error: 'bad_request', message: 'A cropped image is required.' }, { status: 400 });
  }

  // ─── Google Vision "Lens-style" grounding: run Web Detection on the same
  // tight crop and fold Google's best-guess + matched entities into the model
  // prompt. Dark unless GOOGLE_VISION_API_KEY is set; fail-soft.
  let visionGround = '';
  let visionMatch = ''; // diagnostic: what Google matched (shown in response)
  if (googleVisionEnabled()) {
    try {
      // Web Detection IS the Google Lens engine — it needs the FULL frame
      // (badges, body-panel shape) to match, NOT the tight tap crop (which
      // strips the identifying badge, e.g. "ZL1"). Feed it the full image the
      // client already sent for SAM.
      const gvB64 = body.fullImageDataUrl ? (body.fullImageDataUrl.split(',')[1] || img.data) : img.data;
      const wd = await webDetect(gvB64);
      if (wd) { visionGround = webDetectPromptBlock(wd); visionMatch = [wd.text ? `text:"${wd.text}"` : '', wd.bestGuess || wd.entities[0] || ''].filter(Boolean).join(' · '); }
    } catch { /* fail soft */ }
  }

  // Web-search grounding runs on BOTH providers (Anthropic tool / OpenAI tool).
  const fullSystem = (WEB_SEARCH ? SYSTEM_PROMPT + WEB_SEARCH_RULE : SYSTEM_PROMPT) + visionGround;
  // The tight crop nails WHERE the tap was, but strips identifying context —
  // badges/logos ("ZL1", "SRT"), body-panel shape, adjacent trim. We send the
  // model BOTH: the tight crop (focus) + the full frame (badge/context), so it
  // can read the badge the way Google Lens does instead of guessing the part.
  const fullFrame = body.fullImageDataUrl && body.fullImageDataUrl !== vlmImageDataUrl ? body.fullImageDataUrl : '';
  const fullFrameParsed = fullFrame ? parseDataUrl(fullFrame) : null;
  const userQ = 'What exact part is this, and where can I buy it for my vehicle?' +
    (fullFrame ? ' The FIRST image is a tight crop of the exact part I tapped (identify THIS). The SECOND image is the wider scene — use it ONLY to read visible badges/logos/text (e.g. "ZL1", "SRT", "AMG") and the body-panel shape to pin down the make/model; do not identify a different part from it.' : '') +
    ' Reply with ONLY the JSON object.';
  let content = '';
  try {
    if (USE_ANTHROPIC) {
      const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
      const tools = WEB_SEARCH
        ? ([{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }] as unknown as Anthropic.MessageCreateParams['tools'])
        : undefined;
      const msg = await anthropic.messages.create({
        model: IDENTIFY_MODEL,
        max_tokens: 1500,
        system: fullSystem,
        tools,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.data } },
            ...(fullFrameParsed ? [{ type: 'image' as const, source: { type: 'base64' as const, media_type: fullFrameParsed.mediaType, data: fullFrameParsed.data } }] : []),
            { type: 'text', text: userQ },
          ],
        }],
      }, { timeout: 40_000 });
      content = msg.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n');
    } else {
      // OpenAI Responses API (gpt-5.5). reasoning low + json_object. Web search
      // via the Responses `web_search` tool when enabled; if that param is
      // rejected we retry WITHOUT it so identify never hard-fails on a tool
      // mismatch. Google Vision grounding is already folded into the system.
      const body = (withSearch: boolean) => JSON.stringify({
        model: IDENTIFY_MODEL,
        reasoning: { effort: 'low' },
        text: { format: { type: 'json_object' } },
        max_output_tokens: 2000,
        ...(withSearch ? { tools: [{ type: 'web_search' }] } : {}),
        input: [
          { role: 'system', content: [{ type: 'input_text', text: fullSystem }] },
          { role: 'user', content: [
            { type: 'input_text', text: userQ },
            { type: 'input_image', image_url: vlmImageDataUrl, detail: 'high' },
            ...(fullFrame ? [{ type: 'input_image', image_url: fullFrame, detail: 'high' }] : []),
          ] },
        ],
      });
      const callOA = (withSearch: boolean) => fetch(OPENAI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
        body: body(withSearch),
        signal: AbortSignal.timeout(40_000),
      });
      let r = await callOA(WEB_SEARCH);
      if (!r.ok && WEB_SEARCH) {
        console.error('[identify] openai web_search rejected, retrying plain; status', r.status);
        r = await callOA(false);
      }
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        console.error('[identify] openai', r.status, t.slice(0, 300));
        return NextResponse.json({ error: 'identify_failed', message: 'Could not identify that part. Try tapping again or zooming in.' }, { status: 502 });
      }
      content = extractOpenAIText(await r.json());
    }
  } catch (err) {
    console.error('[identify]', USE_ANTHROPIC ? 'anthropic' : 'openai', 'failed:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'identify_failed', message: 'Identify is temporarily unavailable. Try again in a moment.' }, { status: 502 });
  }

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

  // ─── WHICH → FACTS: eBay Browse resolver. The model classifies; eBay's live
  // listings supply the VERIFIED part number (≥2 agreeing listings) + real
  // affiliate buy links. Runs for EVERY identified part (was body-panel-only,
  // which left common parts — rotors, filters, sensors — with no part number).
  // Dark unless EBAY_APP_ID/CERT are set; fail-soft.
  let ebayReported = false; // PN came from the ≥2-seller "reported" tier (not verified)
  let ebayDebug: Record<string, unknown> | null = null;
  if (ebayEnabled() && part.category && part.category !== 'other') {
    try {
      // On a vehicle mismatch, the OCR/visual match (e.g. "ZL1 · Camaro ZL1
      // hood") is the right vehicle seed; otherwise use the garage vehicle.
      const vehSeed = vehicleMismatch
        ? visionMatch.replace(/text:"([^"]*)"/, '$1').replace(/·/g, ' ')
        : [vehicle?.year, vehicle?.make, vehicle?.model, vehicle?.trim].filter(Boolean).join(' ');
      const q = [part.brand, vehSeed, part.name, part.spec].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      // Pass category + garage trim so the resolver can trim-filter listings for
      // performance packages (SRT/392 → Brembo). Skip on a mismatch — the garage
      // trim isn't the vehicle in the photo then.
      const r = await resolveEbay(q, part.oemPartNumbers[0], vehicleMismatch ? undefined : {
        category: part.category, make: vehicle?.make, model: vehicle?.model, trim: vehicle?.trim,
      });
      if (isFounder) ebayDebug = { query: q, verifiedPartNumber: r?.verifiedPartNumber ?? null, reportedPartNumber: r?.reportedPartNumber ?? null, partNumbers: r?.partNumbers ?? [], listings: r?.listings?.length ?? 0 };
      if (r) {
        if (r.listings.length) part.ebayListings = r.listings.slice(0, 3);
        // Promote the best eBay number we have — verified (≥3 sellers) OR
        // reported (≥2). partNumberVerified (the strong badge) only when verified.
        const pn = r.verifiedPartNumber || r.reportedPartNumber;
        if (pn) {
          const norm = pn.toUpperCase().replace(/\s+/g, '');
          part.oemPartNumbers = [pn, ...part.oemPartNumbers.filter((p) => p.toUpperCase().replace(/\s+/g, '') !== norm)].slice(0, 4);
          part.partNumberVerified = !!r.verifiedPartNumber;
          ebayReported = !r.verifiedPartNumber; // reported-only tier
        }
      }
    } catch { /* fail soft — keep the model's part + search links */ }
  }

  // Provenance (which path served this part's PN) — highest trust first. Note a
  // model web-search "verified" PN gets NO bypass: it only reaches 'catalog' if
  // corroborated in catalogPNs, else it's 'model_search_fallback' (search links).
  if (part.partNumberVerified) part.source = 'ebay_verified';
  else if (ebayReported) part.source = 'ebay_reported';
  else if (part.oemPartNumbers.length && pnTrusted) part.source = 'catalog';
  else if (part.oemPartNumbers.length) part.source = 'model_search_fallback';

  // DEEP BUY LINK — a web-search-verified PRODUCT page for THIS part on the YMMT
  // vehicle, prepended as the PRIMARY buy link so the Buy button deep-links
  // straight to the product (not a generic search). Rejected if it looks like a
  // search-results / homepage URL. Skipped on a vehicle mismatch (garage YMMT
  // wouldn't be the right vehicle then).
  const vProdUrl = typeof parsed.verifiedProductUrl === 'string' ? parsed.verifiedProductUrl.trim() : '';
  const vVendor = typeof parsed.verifiedVendor === 'string' ? parsed.verifiedVendor.trim().slice(0, 40) : '';
  const looksLikeSearch = (u: string) => /\/s\?k=|[?&]k=|\/sch\/|[?&]_nkw=|\/search\?|[?&]q=|\/partsearch\/|google\.[a-z.]+\/search|\/dp\/$|\.(com|net|org)\/?$/i.test(u);
  let verifiedDeepUrl: string | null = null;
  if (vProdUrl && /^https?:\/\/[^\s]+$/i.test(vProdUrl) && !looksLikeSearch(vProdUrl) && !vehicleMismatch) {
    verifiedDeepUrl = vProdUrl;
    const vk = /mopar/i.test(vVendor) ? 'mopar_parts_giant' : /gm\b/i.test(vVendor) ? 'gm_parts_giant'
      : /rockauto/i.test(vVendor) ? 'rockauto' : /ebay/i.test(vVendor) ? 'ebay_motors'
      : /amazon/i.test(vVendor) ? 'amazon' : /summit/i.test(vVendor) ? 'summit_racing' : 'rockauto';
    part.vendorLinks = [
      { vendor: vk as IdentifiedPart['vendorLinks'][number]['vendor'], displayName: vVendor || 'Buy the part', url: vProdUrl, searchQuery: name, linkType: 'deep', priority: 0, rationale: 'web-search-verified product page' },
      ...(part.vendorLinks || []),
    ];
  }

  // PERFORMANCE-UPGRADE TIER — curated aftermarket-brand search links (Power
  // Stop, EBC…) next to the OEM row, for owners who run aftermarket. Data-gated
  // (only categories in the brand table get options). On a vehicle mismatch we
  // don't trust the garage trim for platform selection, so drop it → category
  // default brands with a generic search. Honesty: these are searches, not
  // verified parts — the UI styles them lower-confidence than the OEM row.
  const upgradeOptions = buildUpgradeOptions(part.category, part.name, vehicleMismatch ? undefined : (vehicle ?? undefined));
  if (upgradeOptions.length) part.upgradeOptions = upgradeOptions;

  const relatedId = typeof parsed.relatedKnownIssueId === 'string' ? parsed.relatedKnownIssueId.trim() : '';
  const relatedIssue = relatedId ? issueIdByHint.find(i => i.id === relatedId) || null : null;
  // TOP OF THE TRUST HIERARCHY: the matched issue's curated fixParts (human/DB-
  // verified, already affiliate-tagged). These are surfaced ABOVE the model/eBay
  // re-derivation — the diagnosis's own "everything you need" repair kit.
  const relatedIssueParts: IssuePart[] = relatedIssue ? toIssueParts(fixPartsById.get(relatedIssue.id)) : [];

  return NextResponse.json({
    ok: true,
    part,
    box: refinedBox,
    polygon: refinedPolygon, // full-image PERCENT points; null when SAM off/failed
    samRefined: !!refinedPolygon,
    visionMatch, // diagnostic: Google Vision's best guess ('' if disabled/no match)
    vehicleMismatch,
    vehicleMismatchNote: vehicleMismatch ? vehicleMismatchNote : '',
    relatedIssue: relatedIssue ? { id: relatedIssue.id, title: relatedIssue.title } : null,
    relatedIssueParts, // [] unless the matched issue carries verified fixParts
    // FOUNDER-ONLY pipeline trace — the full Stage 1→4 decision trail for debugging.
    ...(isFounder ? {
      trace: {
        // vehicleReceived is the SMOKING GUN for "why did Amazon drop year/trim":
        // if this is null (or missing trim), the query falls back to the model's
        // bare "make model" text — exactly the wrong-trim symptom.
        vehicleReceived: vehicle,
        vehicleRaw: body.vehicle ?? null,
        stage1_where: { samEnabled: samEnabled(), usedSamCrop: !!refinedPolygon, box: refinedBox, voiceQueryHint: queryHint || null },
        stage2_grounding: { model: IDENTIFY_MODEL, catalogPnCount: catalogPNs.size, catalogPnSample: [...catalogPNs].slice(0, 8), knownIssueCandidates: issueIdByHint.length, visionMatch },
        stage3_model: { category, name, brand: part.brand, spec: part.spec, oemPartNumbers_raw: oemPartNumbers, searchQuery: typeof parsed.searchQuery === 'string' ? parsed.searchQuery : null, verifiedProductUrl: verifiedDeepUrl, verifiedVendor: vVendor || null, confidence, vehicleMismatch, relatedKnownIssueId: relatedId || null },
        stage4_facts: {
          pnTrusted, ebay: ebayDebug,
          source: part.source ?? null, partNumberVerified: !!part.partNumberVerified,
          finalOemPartNumbers: part.oemPartNumbers,
          vendorLinks: (part.vendorLinks || []).map((l) => ({ vendor: l.vendor, linkType: l.linkType, url: l.url })),
          ebayListingCount: part.ebayListings?.length ?? 0,
        },
        relatedIssue: relatedIssue?.title ?? null,
        relatedIssuePartsCount: relatedIssueParts.length,
      },
    } : {}),
  });
}

/** Map a KnownIssue.fixParts JSON blob into the buyable IssuePart shape. Keeps
 *  only rows with a name + at least one buy link; eBay links get EPN-tagged. */
function toIssueParts(raw: unknown): IssuePart[] {
  if (!Array.isArray(raw)) return [];
  const out: IssuePart[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const name = String(o.component || o.name || '').trim();
    if (!name) continue;
    const buyLinks = Array.isArray(o.buyLinks)
      ? (o.buyLinks as unknown[])
          .map((b) => {
            const bb = (b || {}) as Record<string, unknown>;
            const vendor = String(bb.vendor || '');
            let url = String(bb.url || '');
            if (!url) return null;
            if (/(^|\.)ebay\./i.test(url)) url = ebayAffiliate(url);
            return { vendor, url };
          })
          .filter((b): b is { vendor: string; url: string } => !!b)
      : [];
    if (buyLinks.length === 0) continue;
    out.push({
      name: name.length > 90 ? name.slice(0, 90).trim() : name,
      oemPartNumber: o.oemPartNumber ? String(o.oemPartNumber) : undefined,
      priceLow: typeof o.priceLow === 'number' ? o.priceLow : undefined,
      priceHigh: typeof o.priceHigh === 'number' ? o.priceHigh : undefined,
      note: o.note ? String(o.note) : undefined,
      buyLinks,
      source: 'known_issue',
    });
  }
  return out.slice(0, 8);
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

type AnthropicMedia = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

/** Split a data URL into an Anthropic-compatible media type + base64 body. */
function parseDataUrl(url: string): { mediaType: AnthropicMedia; data: string } | null {
  const m = url.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/);
  if (m) return { mediaType: m[1] as AnthropicMedia, data: m[2] };
  const idx = url.indexOf(',');
  if (idx > -1) return { mediaType: 'image/jpeg', data: url.slice(idx + 1) };
  return null;
}

/** Crop the full frame to a SAM box (PERCENT) + padding via sharp, returning a
 *  jpeg data URL. This is what tightens the model's input to just the part. */
async function cropToBox(buf: Buffer, box: SamBox, pad = 0.1): Promise<string | null> {
  try {
    const meta = await sharp(buf).metadata();
    const W = meta.width || 0, H = meta.height || 0;
    if (!W || !H) return null;
    const padW = box.w * pad, padH = box.h * pad;
    const x = Math.max(0, Math.round(((box.x - padW) / 100) * W));
    const y = Math.max(0, Math.round(((box.y - padH) / 100) * H));
    const w = Math.min(W - x, Math.round(((box.w + 2 * padW) / 100) * W));
    const h = Math.min(H - y, Math.round(((box.h + 2 * padH) / 100) * H));
    if (w < 8 || h < 8) return null;
    const out = await sharp(buf)
      .extract({ left: x, top: y, width: w, height: h })
      .resize({ width: 768, height: 768, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toBuffer();
    return `data:image/jpeg;base64,${out.toString('base64')}`;
  } catch {
    return null;
  }
}

function extractOpenAIText(data: unknown): string {
  const d = data as {
    output_text?: string;
    output?: Array<{ type?: string; content?: Array<{ text?: string }> }>;
  };
  if (d?.output_text) return d.output_text;
  if (Array.isArray(d?.output)) {
    for (const item of d.output) {
      if (item?.type === 'message' && Array.isArray(item.content)) {
        for (const c of item.content) if (typeof c?.text === 'string' && c.text.length) return c.text;
      }
    }
  }
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
