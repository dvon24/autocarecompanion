import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import {
  hubChatMinuteLimiter,
  getClientIp,
  rateLimitResponse,
} from '@/lib/rate-limit';
import {
  checkAndConsumePhotoQuota,
  refundPhotoQuota,
  DEFAULT_FREE_PHOTO_LIMIT,
} from '@/lib/photo-quota';
import { checkAiGate, isAiGateBlocked } from '@/lib/ai-gate';
import { getVehicleSpecs } from '@/lib/maintenance';

export const maxDuration = 60;
export const runtime = 'nodejs';

/**
 * POST /api/vision — Tier 1 photo-to-part MVP.
 *
 * Accepts an image upload + vehicle context. Uses GPT-5.5 vision to
 * identify the part visible, cross-references KnownIssues + cached
 * parts for the user's vehicle, and returns a structured response
 * that VisionResultCard renders inline in the chat conversation.
 *
 * Subscription gating:
 *   - Anonymous → 401 (must sign in; vision is auth-required from
 *     v1 since it's the magic-moment upsell trigger)
 *   - Authed-free → 3 photos/month (per pricing brief)
 *   - Subscriber → unlimited
 *
 * Privacy: images are processed in-memory and NOT stored. The
 * vision model sees the base64 once; no copy is persisted to disk
 * or DB. GDPR opt-out (aiProcessingOptOut) short-circuits before
 * any API call.
 *
 * Request: multipart/form-data
 *   - image: File (jpeg/png/webp, max 10MB)
 *   - vehicle: JSON string { year, make, model, trim }
 *   - caption: optional string — user's description of what they're
 *     showing ("this is what's leaking", "bad spot on my fender")
 *
 * Response: { vision: VisionResult } per the VisionResult schema below.
 */

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
// Default to gpt-5.2 because gpt-5.5 (reasoning model) was consistently
// hitting our 55s OpenAI timeout on production uploads — proven by the
// diagnostic trace from build f155c5b showing 58.9s server response.
// gpt-5.2 is a non-reasoning vision-capable model that responds in
// ~5-10s reliably. Override via OPENAI_VISION_MODEL env var.
const MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-5.2';
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SUBSCRIBER_MONTHLY_CAP = 10_000; // effective unlimited; throttles only runaway abuse

interface VehicleCtx {
  year: number;
  make: string;
  model: string;
  trim?: string;
}

export async function POST(request: NextRequest) {
  // STEP 1 DIAGNOSTICS — every response now carries x-au7o-req-id so
  // the client trace and server logs can be joined. vlog() writes a
  // single JSON line greppable as `"tag":"vision"` in Vercel logs.
  const reqId = (globalThis.crypto?.randomUUID?.() || `r${Date.now()}`).slice(0, 8);
  const t0 = Date.now();
  const vlog = (phase: string, extra?: Record<string, unknown>) => {
    try {
      console.log(JSON.stringify({ tag: 'vision', reqId, phase, dt: Date.now() - t0, ...(extra || {}) }));
    } catch { /* logging must never throw */ }
  };
  // Wrap NextResponse.json so every response — including failures —
  // emits the reqId header and a `responded` log line.
  const respond = (body: unknown, init?: ResponseInit): NextResponse => {
    const status = init?.status || 200;
    vlog('responded', { status });
    const res = NextResponse.json(body, init);
    res.headers.set('x-au7o-req-id', reqId);
    return res;
  };
  vlog('request_received', { contentLength: request.headers.get('content-length') });

  if (!OPENAI_KEY) {
    return respond({ error: 'service_unavailable', message: 'Vision is offline.' }, { status: 503 });
  }

  // GDPR opt-out short-circuit.
  const gate = await checkAiGate();
  if (isAiGateBlocked(gate)) return gate;

  // Auth required for vision in v1 — it's the magic-moment subscription
  // trigger, so anonymous users get bounced to signup instead of a free
  // trial here. Free trial may come later if data shows it converts.
  let session;
  try { session = await auth(); } catch { session = null; }
  vlog('auth_done', { authed: !!session?.user?.id });
  if (!session?.user?.id) {
    return respond({
      error: 'login_required',
      message: 'Sign in free to analyze photos of your vehicle.',
      gated: true,
      ctaUrl: '/auth/signup',
      ctaLabel: 'Start free — sign in',
      secondaryCtaUrl: '/auth/signin',
      secondaryCtaLabel: 'Sign in',
    }, { status: 401 });
  }
  const userId = session.user.id;
  const isSubscriber = session.user.subscriptionStatus === 'active';

  // Burst protection — applies to everyone.
  const ip = getClientIp(request);
  const burst = hubChatMinuteLimiter.check(ip);
  if (!burst.success) {
    vlog('burst_blocked');
    return rateLimitResponse(burst.reset);
  }

  // Photo quota: free = 3/mo, subscriber = effectively unlimited.
  // NOTE: this CONSUMES one credit immediately. Every failure path below
  // must call refundPhotoQuota(quotaKey) before returning, or the user
  // silently loses a free analysis to a server error. See the
  // `refundOnFailure` flag pattern at the end of this function.
  const limit = isSubscriber ? SUBSCRIBER_MONTHLY_CAP : DEFAULT_FREE_PHOTO_LIMIT;
  const quotaKey = `photo:user:${userId}`;
  const quota = await checkAndConsumePhotoQuota({ key: quotaKey, limit });
  vlog('quota_checked', { allowed: quota.allowed, remaining: quota.remaining });
  if (!quota.allowed) {
    return respond({
      error: 'quota_exceeded',
      message: `You've used your ${DEFAULT_FREE_PHOTO_LIMIT} free photo analyses this month. Go unlimited with Au7o Pro.`,
      resetAt: quota.resetAt.toISOString(),
      remaining: 0,
      limit,
      gated: true,
      ctaUrl: '/account',
      ctaLabel: 'Go unlimited — $9.99/mo',
    }, { status: 429 });
  }

  // Helper that refunds the quota credit and returns the error response.
  // Used on every post-consume failure path so users don't lose their
  // free monthly photo analyses to server errors they can't recover from.
  async function failWithRefund(body: Record<string, unknown>, status: number): Promise<NextResponse> {
    await refundPhotoQuota(quotaKey);
    return respond(body, { status });
  }

  // Parse multipart body.
  let form: FormData;
  try {
    form = await request.formData();
  } catch (err) {
    vlog('formdata_failed', { err: err instanceof Error ? err.message : String(err) });
    return failWithRefund({ error: 'bad_form' }, 400);
  }
  vlog('formdata_parsed');

  const imageFile = form.get('image');
  if (!(imageFile instanceof File)) {
    return failWithRefund({ error: 'missing_image' }, 400);
  }
  if (imageFile.size > MAX_IMAGE_BYTES) {
    return failWithRefund({ error: 'image_too_large', message: 'Image must be 10MB or smaller. Try a lower-quality phone setting or crop tighter.' }, 413);
  }
  // OpenAI vision accepts PNG, JPEG, WebP, and non-animated GIF only —
  // NOT HEIC/HEIF. The downscaler is supposed to convert HEIC client-side
  // before upload; if a HEIC slips through, reject early with a clear
  // message rather than waste an OAI call that 400s.
  if (!/^image\/(jpe?g|png|webp|gif)$/i.test(imageFile.type || '')) {
    return failWithRefund({ error: 'unsupported_type', message: 'Use a JPEG, PNG, or WebP image. iPhone HEIC photos: enable "Most Compatible" in Settings → Camera → Formats, then try again.' }, 415);
  }

  let vehicle: VehicleCtx | null = null;
  try {
    const raw = form.get('vehicle');
    if (typeof raw === 'string') vehicle = JSON.parse(raw);
  } catch { /* fall through; vehicle is optional but encouraged */ }

  const caption = (form.get('caption') as string | null) || '';

  vlog('image_validated', { size: imageFile.size, type: imageFile.type });

  // Convert to base64 data URL for the OpenAI vision call. In-memory
  // only — never written to disk.
  const buf = Buffer.from(await imageFile.arrayBuffer());
  const dataUrl = `data:${imageFile.type};base64,${buf.toString('base64')}`;
  vlog('buffer_built', { bytes: buf.length });

  // Load context: known issues + cached parts for this vehicle, so the
  // vision model's answer is grounded in YMMT-specific knowledge.
  // Cheap parallel reads.
  let knownIssuesContext = '';
  let cachedPartsContext = '';
  let specsContext = '';
  if (vehicle && vehicle.year && vehicle.make && vehicle.model) {
    try {
      const [issues, cachedParts] = await Promise.all([
        prisma.knownIssue.findMany({
          where: {
            make: { equals: vehicle.make, mode: 'insensitive' },
            model: { equals: vehicle.model, mode: 'insensitive' },
            years: { has: vehicle.year },
            status: 'published',
          },
          select: { id: true, title: true, category: true, severity: true, symptoms: true },
          take: 15,
          orderBy: { reportCount: 'desc' },
        }),
        prisma.vehiclePartLookup.findMany({
          where: {
            year: vehicle.year,
            make: { equals: vehicle.make, mode: 'insensitive' },
            model: { equals: vehicle.model, mode: 'insensitive' },
          },
          select: { task: true, parts: true },
          take: 12,
        }),
      ]);

      if (issues.length > 0) {
        // Cap to top 6 — anything past that is noise that bloats the system
        // prompt (each extra issue = ~30 tokens × every request = slower
        // first-token latency).
        knownIssuesContext = `\n\nKNOWN ISSUES for ${vehicle.year} ${vehicle.make} ${vehicle.model}:
${issues.slice(0, 6).map(i => `- ${i.title} (id: ${i.id})`).join('\n')}`;
      }

      if (cachedParts.length > 0) {
        const lines = cachedParts.map(cp => {
          const parts = Array.isArray(cp.parts) ? (cp.parts as Array<{ brand?: string; partNumber?: string; name?: string }>) : [];
          const top = parts.slice(0, 2).map(p => `${p.brand || ''} ${p.partNumber || ''} ${p.name || ''}`.trim()).join('; ');
          return `- ${cp.task}: ${top}`;
        });
        cachedPartsContext = `\n\nCACHED PARTS for this vehicle (verified — use directly when relevant):
${lines.join('\n')}`;
      }

      const specs = getVehicleSpecs(vehicle);
      if (specs) {
        const lines: string[] = [];
        if (specs.engine) lines.push(`Engine: ${specs.engine}`);
        if (specs.oil) lines.push(`Oil: ${specs.oil.type}, filter ${specs.oil.filterPartNumber}`);
        if (specs.lug) lines.push(`Lug: ${specs.lug.size} ${specs.lug.useBolts ? 'bolts' : 'nuts'}, ${specs.lug.torque}`);
        if (lines.length > 0) specsContext = `\n\nVEHICLE SPECS:\n${lines.join('\n')}`;
      }
    } catch (err) {
      vlog('prisma_context_failed', { err: err instanceof Error ? err.message : String(err) });
      /* non-blocking — vision still answers without context */
    }
  }
  vlog('prisma_context_done');

  const vehicleDesc = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}` : 'unknown vehicle';

  const SYSTEM_PROMPT = `You are an expert automotive technician analyzing a photo from a vehicle owner.

Vehicle: ${vehicleDesc}.${specsContext}${knownIssuesContext}${cachedPartsContext}

User's description (may be empty): ${caption || '(none provided)'}

Your job:
1. Identify what's visible in the photo — be specific (e.g., "driver-side LED projector headlight assembly with cracked lens" not just "headlight").
2. If the photo is NOT a car part or vehicle area, say so clearly — do not invent an answer. Set primaryPart = null in that case.
3. If the part is visible, cross-reference the KNOWN ISSUES list above. If the photo matches a documented issue for THIS vehicle, link it via its id.
4. Provide the COMPLETE repair kit: main part + fasteners (bolts/clips/washers) + consumables (gaskets/fluids/sealants) + tools needed. Owners under-purchase one of these and have to make a second trip — that's what we solve.
5. For each part, give a search query Amazon would understand (with brand + part number when possible). Use the Au7o affiliate tag: au7o-20.
6. Difficulty: easy / medium / hard. Estimated DIY time. Safety warnings if any.

Return ONLY a JSON object — no markdown fences, no preamble, no commentary before or after. Start your response with { and end it with }. Schema:
{
  "summary": "1-2 sentence plain-English diagnosis the user can scan in 3 seconds",
  "confidence": 0.0-1.0,
  "isCarRelated": true|false,
  "primaryPart": null OR {
    "name": "...",
    "brand": "...",
    "partNumber": "...",
    "amazonSearch": "Motorcraft SP-546 spark plug"
  },
  "kitItems": [{ "name": "...", "spec": "...", "amazonSearch": "..." }],
  "consumables": [{ "name": "...", "spec": "...", "amazonSearch": "..." }],
  "toolsNeeded": ["..."],
  "difficulty": "easy"|"medium"|"hard",
  "estimatedTimeMinutes": 30,
  "warnings": ["..."],
  "relatedKnownIssueIds": ["existing-issue-id-1"]
}`;

  // Build the OpenAI request body. NOTE: deliberately NOT using
  // `response_format: { type: 'json_object' }` — it is incompatible with
  // some gpt-5.x model versions when combined with image input, returning
  // 400 "response_format not supported with this model+input combo". The
  // system prompt explicitly tells the model to return ONLY a JSON object
  // and the extractor below tolerates an opening prose line or markdown
  // code fence just in case.
  // 6000 covers both internal reasoning tokens (gpt-5.x burns 1-3k thinking)
  // AND the ~1500 tokens of JSON output we actually want. Earlier value (1800)
  // was getting fully consumed by reasoning, leaving message.content empty and
  // triggering the misleading "empty response" path.
  // detail: 'low' fixes a hard 512×512 image input — the fastest tier
  // per OpenAI docs. For "is this a rim/headlight/spark plug?" part-ID
  // it's more than enough; we lose some ability to read tiny text or
  // spot hairline cracks but gain ~3-5x latency improvement which is
  // load-bearing for the MVP magic moment. Bumping to 'high' is a
  // future opt-in for "show me a more detailed answer".
  // max_completion_tokens: 2500 — gpt-5.2 is non-reasoning so it
  // doesn't need the 5500-token buffer gpt-5.5 was burning on thinking.
  const openaiBody = {
    model: MODEL,
    max_completion_tokens: 2500,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: caption ? `My note: ${caption}\n\nWhat is this and what do I need to fix it?` : 'What is this and what do I need to fix it?' },
          { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
        ],
      },
    ],
  };

  let openaiResp: Response;
  vlog('openai_fetch_start', { model: MODEL });
  try {
    openaiResp = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(openaiBody),
      signal: AbortSignal.timeout(55_000),
    });
    vlog('openai_headers_received', { status: openaiResp.status });
  } catch (err) {
    console.error('[vision] OpenAI fetch failed:', err);
    return failWithRefund({ error: 'vision_failed', message: 'Photo analysis temporarily unavailable. Try again in a moment.' }, 502);
  }

  if (!openaiResp.ok) {
    const txt = await openaiResp.text().catch(() => '');
    console.error('[vision] OpenAI', openaiResp.status, 'model=', MODEL, 'body=', txt.slice(0, 500));
    // Log upstream body server-side only; don't leak OAI internal error
    // text to the client (could include internal IDs or sensitive hints).
    return failWithRefund({
      error: 'vision_failed',
      message: `Photo analysis failed (upstream HTTP ${openaiResp.status}). Try a clearer photo or different angle.`,
      upstreamStatus: openaiResp.status,
    }, 502);
  }

  const data = await openaiResp.json();
  vlog('openai_json_done', { usage: data?.usage, finishReason: data?.choices?.[0]?.finish_reason });
  const choice = data?.choices?.[0];
  const content: string = choice?.message?.content || '';
  const finishReason: string = choice?.finish_reason || '';
  const refusal: string = choice?.message?.refusal || '';
  if (!content) {
    console.error('[vision] OpenAI 200 but empty content.',
      'finish_reason=', finishReason,
      'refusal=', refusal.slice(0, 200),
      'usage=', JSON.stringify(data?.usage || {}),
      'choices=', JSON.stringify(data?.choices || []).slice(0, 400));
    let userMsg = 'Photo analysis returned no content. Try again — usually works on retry.';
    if (finishReason === 'length') {
      userMsg = 'Photo analysis hit its internal capacity. Try again — usually works on retry.';
    } else if (finishReason === 'content_filter' || refusal) {
      userMsg = 'Photo analysis declined to answer. Try a different photo of just the part.';
    }
    return failWithRefund({
      error: 'empty_response',
      message: userMsg,
      finishReason,
    }, 502);
  }

  // Robust JSON extraction. Handles three cases the model might emit:
  //   1. Pure JSON: "{...}"
  //   2. Markdown-fenced: "```json\n{...}\n```"
  //   3. Prose + JSON: "Here's the analysis: {...}"
  // We find the first '{' and matching closing '}' by depth counting.
  function extractJson(text: string): Record<string, unknown> | null {
    const trimmed = text.trim();
    // Strip markdown code fence if present.
    const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;
    // Quick attempt.
    try { return JSON.parse(candidate) as Record<string, unknown>; } catch { /* try harder below */ }
    // Find first '{' and balance braces (ignoring quoted strings).
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
        const sub = candidate.slice(start, i + 1);
        try { return JSON.parse(sub) as Record<string, unknown>; } catch { return null; }
      } }
    }
    return null;
  }

  const parsed = extractJson(content);
  if (!parsed) {
    console.error('[vision] could not extract JSON from model output. content=', content.slice(0, 500));
    return failWithRefund({ error: 'parse_failed', message: 'Photo analysis returned an unexpected format. Try again.' }, 502);
  }

  // Build affiliate URLs from the model's amazonSearch strings.
  const TAG = 'au7o-20';
  const amazonUrl = (q: string | undefined) => q ? `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${TAG}` : null;
  const decorateItem = (it: unknown) => {
    if (!it || typeof it !== 'object') return null;
    const r = it as { name?: string; spec?: string; brand?: string; partNumber?: string; amazonSearch?: string };
    if (!r.name) return null;
    return {
      name: r.name,
      spec: r.spec || '',
      brand: r.brand || '',
      partNumber: r.partNumber || '',
      amazonUrl: amazonUrl(r.amazonSearch || `${r.brand || ''} ${r.partNumber || ''} ${r.name}`.trim()),
    };
  };

  const primaryRaw = parsed.primaryPart as Record<string, unknown> | null | undefined;
  const primary = primaryRaw ? decorateItem(primaryRaw) : null;

  // Look up the related known-issue rows to attach real URLs.
  const relatedIssueIds = Array.isArray(parsed.relatedKnownIssueIds) ? parsed.relatedKnownIssueIds.filter((x: unknown): x is string => typeof x === 'string').slice(0, 4) : [];
  let relatedIssues: Array<{ id: string; title: string; severity: string }> = [];
  if (relatedIssueIds.length > 0) {
    try {
      const rows = await prisma.knownIssue.findMany({
        where: { id: { in: relatedIssueIds }, status: 'published' },
        select: { id: true, title: true, severity: true },
      });
      relatedIssues = rows;
    } catch { /* silent */ }
  }

  const result = {
    summary: String(parsed.summary || ''),
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    isCarRelated: parsed.isCarRelated !== false,
    primaryPart: primary,
    kitItems: (Array.isArray(parsed.kitItems) ? parsed.kitItems : []).map(decorateItem).filter(Boolean),
    consumables: (Array.isArray(parsed.consumables) ? parsed.consumables : []).map(decorateItem).filter(Boolean),
    toolsNeeded: Array.isArray(parsed.toolsNeeded) ? parsed.toolsNeeded.filter((t: unknown): t is string => typeof t === 'string') : [],
    difficulty: ['easy','medium','hard'].includes(String(parsed.difficulty)) ? parsed.difficulty as string : 'medium',
    estimatedTimeMinutes: typeof parsed.estimatedTimeMinutes === 'number' ? parsed.estimatedTimeMinutes : null,
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.filter((w: unknown): w is string => typeof w === 'string') : [],
    relatedIssues,
    quotaRemaining: quota.remaining,
    quotaResetAt: quota.resetAt.toISOString(),
  };

  return respond({ vision: result });
}
