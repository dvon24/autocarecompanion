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
import { attachVendorLinks } from '@/lib/vendor-resolver';
import type { IdentifiedPart, PartCategory, PartRole } from '@/types/vision';

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
// Switched from /v1/chat/completions to /v1/responses per OpenAI's
// recommended pattern for vision + structured JSON. Responses API
// supports `reasoning.effort` (the actual lever for fast gpt-5.5),
// `text.format: json_object` (guaranteed JSON output), and a cleaner
// input_image content shape.
const OPENAI_URL = 'https://api.openai.com/v1/responses';
// Back to gpt-5.5 — the prior switch to gpt-5.2 was a defensive
// fallback because gpt-5.5 at default reasoning was hitting our 55s
// timeout. With reasoning.effort: 'low' on the Responses API the
// model returns in ~3-6s while keeping 5.5's superior vision
// accuracy. Override via OPENAI_VISION_MODEL env var.
const MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-5.5';
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

  // ─── Detect mode: single image (photo) vs multi-frame + audio (video) ─
  //
  // Photo flow (unchanged): form.get('image') → one File.
  // Video flow (new):       form.getAll('frames') → N Files + optional
  //                         form.get('audio') → one File for Whisper.
  // Mode is implicit from which field is present.
  const rawFrames = form.getAll('frames').filter((f): f is File => f instanceof File);
  const isVideoMode = rawFrames.length > 0;

  let images: File[] = [];
  let audioFile: File | null = null;
  let mode: 'photo' | 'video' = 'photo';

  if (isVideoMode) {
    mode = 'video';
    images = rawFrames.slice(0, 6); // cap at 6 frames to bound cost
    for (const f of images) {
      if (f.size > MAX_IMAGE_BYTES) {
        return failWithRefund({ error: 'image_too_large', message: 'One of your video frames is too large. Try a shorter clip.' }, 413);
      }
      if (!/^image\/(jpe?g|png|webp|gif)$/i.test(f.type || '')) {
        return failWithRefund({ error: 'unsupported_type', message: 'Video frames must be JPEG/PNG/WebP — the client extractor should produce these automatically.' }, 415);
      }
    }
    const rawAudio = form.get('audio');
    if (rawAudio instanceof File && rawAudio.size > 200 && rawAudio.size < 20 * 1024 * 1024) {
      audioFile = rawAudio;
    }
    vlog('video_mode', { frameCount: images.length, hasAudio: !!audioFile, audioSize: audioFile?.size || 0 });
  } else {
    const imageFile = form.get('image');
    if (!(imageFile instanceof File)) {
      return failWithRefund({ error: 'missing_image' }, 400);
    }
    if (imageFile.size > MAX_IMAGE_BYTES) {
      return failWithRefund({ error: 'image_too_large', message: 'Image must be 10MB or smaller. Try a lower-quality phone setting or crop tighter.' }, 413);
    }
    if (!/^image\/(jpe?g|png|webp|gif)$/i.test(imageFile.type || '')) {
      return failWithRefund({ error: 'unsupported_type', message: 'Use a JPEG, PNG, or WebP image. iPhone HEIC photos: enable "Most Compatible" in Settings → Camera → Formats, then try again.' }, 415);
    }
    images = [imageFile];
  }

  let vehicle: VehicleCtx | null = null;
  try {
    const raw = form.get('vehicle');
    if (typeof raw === 'string') vehicle = JSON.parse(raw);
  } catch { /* fall through; vehicle is optional but encouraged */ }

  const caption = (form.get('caption') as string | null) || '';

  vlog('images_validated', { mode, count: images.length, totalBytes: images.reduce((s, f) => s + f.size, 0) });

  // ─── Whisper transcription for video audio (if present) ─────────
  //
  // OpenAI whisper-1 accepts the audio file directly (webm/mp4/m4a/
  // mp3/wav/ogg). Cost is ~$0.006/min — basically free at 30s clips.
  // Result transcript gets injected into the gpt-5.5 prompt as user
  // context so the model can correlate spoken complaint with visual
  // symptoms ("clicks when I brake" + frame showing rotor groove =
  // higher diagnostic confidence).
  let audioTranscript = '';
  if (audioFile) {
    try {
      vlog('whisper_start', { audioSize: audioFile.size, audioType: audioFile.type });
      const whisperForm = new FormData();
      whisperForm.append('file', audioFile);
      whisperForm.append('model', 'whisper-1');
      whisperForm.append('response_format', 'text');
      const whisperResp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
        body: whisperForm,
        signal: AbortSignal.timeout(25_000),
      });
      if (whisperResp.ok) {
        audioTranscript = (await whisperResp.text()).trim().slice(0, 1000);
        vlog('whisper_done', { transcriptLen: audioTranscript.length });
      } else {
        vlog('whisper_failed', { status: whisperResp.status });
      }
    } catch (err) {
      vlog('whisper_error', { err: err instanceof Error ? err.message : String(err) });
    }
  }

  // Convert each image to base64 data URL for the OpenAI vision call.
  // In-memory only — never written to disk.
  const dataUrls: string[] = [];
  let totalBytes = 0;
  for (const img of images) {
    const buf = Buffer.from(await img.arrayBuffer());
    totalBytes += buf.length;
    dataUrls.push(`data:${img.type};base64,${buf.toString('base64')}`);
  }
  vlog('buffer_built', { count: dataUrls.length, totalBytes });

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

${mode === 'video'
  ? `INPUT MODE: VIDEO — you are seeing ${images.length} frames sampled evenly across a short video clip the user uploaded. Look across the frames for symptoms that change over time: rotor pulsing under braking, fluid drip, dashboard warning light flicker, belt slap, smoke. Frame 1 is earliest, frame ${images.length} is latest. The frames are NOT separate photos of separate parts — they're moments of the SAME scene.${audioTranscript ? `\n\nAUDIO TRANSCRIPT (Whisper) from the same clip: "${audioTranscript}"\nUse this as additional context — the user's spoken complaint correlates with what you should look for visually. If the transcript mentions a noise ("clicking", "grinding", "whining"), call that out in the summary and weight your part identification toward the likely source.` : ''}`
  : `INPUT MODE: PHOTO — single still image.`}

User's typed description (may be empty): ${caption || '(none provided)'}

Your job:
1. Identify what's visible in the photo — be specific (e.g., "driver-side LED projector headlight assembly with cracked lens" not just "headlight").
2. If the photo is NOT a car part or vehicle area, say so clearly — do not invent an answer. Set identifiedParts=[] and primaryPartId=null in that case.
3. **Vehicle-match check.** The user is currently viewing their ${vehicleDesc}. Look for any visible cue that identifies the source vehicle: brand badges (Mopar, Honda, Ford), distinctive body lines, specific wheel/grille designs, license plate, interior trim. Set vehicleMatch:
   - "confident" — visible cues clearly match OR the part is generic enough (universal tire, common spark plug) that source vehicle doesn't matter
   - "uncertain" — you cannot tell from the photo (most common for clean part close-ups)
   - "likely_mismatch" — clear visual evidence the part is from a different make/model
   Populate vehicleMatchNote with the actual visual cue used.
   If vehicleMatch is "likely_mismatch", set primaryPartId=null and use summary for the warning.
4. **Identify EVERY buyable part visible in the photo as a separate entry in identifiedParts**, not just the headline one. A single wheel photo typically yields: rotor, brake pads (visible through spokes), caliper, lug nuts, tire, wheel/rim itself, sometimes TPMS sensor. List ALL of them. Surfacing only one is the #1 user complaint. Set role='primary' for any part the user could reasonably want to purchase (clearly visible and meaningful); reserve role='fastener' for small hardware (lug nuts, clips, bolts) and role='consumable' for fluids/sealants the job needs but that aren't shown. Aim for 3-7 entries on a typical wheel/engine-bay photo, not 1.

   For EACH identified part you must produce:
     - category — exact enum: rotor, brake_pad, caliper, tire, wheel, lug_nut, tpms, filter, fluid, wiper, bulb, battery, spark_plug, sensor, belt, hose, suspension, ignition, fuel_pump, alternator, starter, body_panel, trim, badge, emblem, bracket, interior, accessory, tool, oem_specific, other (we route to vendors based on this, be precise)
     - position when relevant ('front-left', 'rear-right', 'driver-side', 'passenger-side', 'both')
     - oemPartNumbers as an ARRAY — give the OEM number when you know it (you know many: e.g. 68249841AA for Challenger SRT front rotors). If left and right have different numbers, include both. Empty array is acceptable if you genuinely don't know — DO NOT fabricate.
     - aftermarketPartNumbers as cross-references when known (e.g. Brembo 09.C394.11). Optional.
     - visibleInPhoto: true for parts literally in the pixels, false for parts you recommend that aren't in frame
     - confidence per part (lower for parts at edge or partially occluded)
     - searchQuery — brand + OEM number + name (e.g. 'Mopar 68249841AA front brake rotor'). The server will use this to construct vendor URLs. DO NOT generate URLs yourself.
     - notes for axle-pair rules, torque specs, anti-seize requirements
5. Set primaryPartId to the id of the part the user most likely came for. For a wheel photo where the user might want any of rotor/pads/tire, pick the most expensive/important one (usually the rotor). The other identified parts stay in identifiedParts.
6. Cross-reference the KNOWN ISSUES list above. If any identified part matches a documented issue for this vehicle, list the issue id in relatedKnownIssueIds.
7. Difficulty: easy / medium / hard. Estimated DIY time. Safety warnings if any.

EXAMPLE — user uploads a photo of a Challenger SRT front wheel showing rim, tire sidewall, lug nuts, brake caliper through spokes, and rotor face. identifiedParts should contain:
- rotor (role:primary, category:rotor, OEM 68249841AA, searchQuery:'Mopar 68249841AA Challenger SRT front rotor', visibleInPhoto:true)
- brake pads (role:primary, category:brake_pad, OEM 68389062AA, visibleInPhoto:true)
- caliper (role:primary, category:caliper, OEM 68144181AA, visibleInPhoto:true)
- tire (role:primary, category:tire, searchQuery includes size like '275/40R20', visibleInPhoto:true)
- wheel/rim (role:primary, category:wheel, visibleInPhoto:true)
- lug nuts (role:fastener, category:lug_nut, OEM 6036432AA, visibleInPhoto:true)
- brake fluid (role:consumable, category:fluid, visibleInPhoto:false — needed for the job)
Seven entries, not one.

Return ONLY a JSON object — no markdown fences, no preamble. Start with { end with }. Schema:
{
  "summary": "1-2 sentence diagnosis",
  "confidence": 0.0-1.0,
  "isCarRelated": true|false,
  "vehicleMatch": "confident"|"uncertain"|"likely_mismatch",
  "vehicleMatchNote": "visual cue used",
  "primaryPartId": "p_rotor" or null,
  "identifiedParts": [
    {
      "id": "p_rotor",
      "role": "primary",
      "category": "rotor",
      "name": "Front brake rotor (vented, 360mm)",
      "spec": "vented, 360mm × 32mm, fits Brembo 6-piston caliper",
      "position": "front-left",
      "confidence": 0.92,
      "visibleInPhoto": true,
      "brand": "OEM Mopar",
      "oemPartNumbers": ["68249841AA"],
      "aftermarketPartNumbers": [{"brand": "Brembo", "partNumber": "09.C394.11"}],
      "searchQuery": "Mopar 68249841AA Challenger SRT front brake rotor",
      "estimatedPriceUsd": {"low": 180, "high": 340},
      "notes": "Replace as axle pair — never one side only."
    }
  ],
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
  // Responses API request shape. Key differences from Chat Completions:
  //   - `input` instead of `messages`
  //   - content uses `input_text` / `input_image` types
  //   - `reasoning.effort: 'low'` is what makes gpt-5.5 return fast
  //     (~3-6s) instead of burning 10-15s on default reasoning
  //   - `text.format.type: 'json_object'` guarantees valid JSON output
  //     so we don't need the extractJson fallback (kept anyway as a
  //     defensive belt-and-suspenders for upstream weirdness)
  //   - `max_output_tokens` replaces `max_completion_tokens`
  const userContent: Array<{ type: string; text?: string; image_url?: string; detail?: string }> = [
    {
      type: 'input_text',
      text: mode === 'video'
        ? (caption
            ? `My note: ${caption}\n\n${audioTranscript ? `What I said in the clip: "${audioTranscript}"\n\n` : ''}What's wrong and what do I need to fix it?`
            : `${audioTranscript ? `What I said in the clip: "${audioTranscript}"\n\n` : ''}What's wrong and what do I need to fix it?`)
        : (caption ? `My note: ${caption}\n\nWhat is this and what do I need to fix it?` : 'What is this and what do I need to fix it?'),
    },
  ];
  for (const u of dataUrls) {
    userContent.push({ type: 'input_image', image_url: u, detail: 'high' });
  }

  const openaiBody = {
    model: MODEL,
    reasoning: { effort: 'low' },
    text: { format: { type: 'json_object' } },
    // 4000 for photo (single frame); 5500 for video (multiple frames +
    // potentially noise classification in the summary).
    max_output_tokens: mode === 'video' ? 5500 : 4000,
    input: [
      {
        role: 'system',
        content: [{ type: 'input_text', text: SYSTEM_PROMPT }],
      },
      {
        role: 'user',
        content: userContent,
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
  // Responses API output shape (different from Chat Completions):
  //   data.output_text — convenience aggregate of all text outputs
  //   data.output[] — array of items (type: 'message' | 'reasoning' | …)
  //   data.output[i].content[j].text — actual text on a message item
  //   data.status — 'completed' | 'incomplete' | 'failed'
  //   data.incomplete_details.reason — 'max_output_tokens' | 'content_filter'
  // Fall through paths cover Chat Completions shape in case OPENAI_VISION_MODEL
  // is pointed at a model that doesn't support /v1/responses yet.
  const status: string = data?.status || '';
  let content: string = data?.output_text || '';
  if (!content && Array.isArray(data?.output)) {
    for (const item of data.output) {
      if (item?.type === 'message' && Array.isArray(item.content)) {
        for (const c of item.content) {
          if (typeof c?.text === 'string' && c.text.length > 0) {
            content = c.text;
            break;
          }
        }
      }
      if (content) break;
    }
  }
  // Chat Completions shape fallback.
  if (!content && data?.choices?.[0]?.message?.content) {
    content = data.choices[0].message.content;
  }
  const finishReason: string = data?.incomplete_details?.reason || data?.choices?.[0]?.finish_reason || status || '';
  type RespContent = { type?: string; refusal?: string; text?: string };
  type RespItem = { type?: string; content?: RespContent[] };
  const refusal: string = (data?.output as RespItem[] | undefined)?.find((i) => i?.type === 'message')?.content?.find((c: RespContent) => c?.type === 'refusal')?.refusal
    || data?.choices?.[0]?.message?.refusal
    || '';
  vlog('openai_json_done', { usage: data?.usage, status, finishReason, hasContent: !!content, contentLen: content.length });
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

  // ─── Parse multi-part response + populate vendor links ────────────
  //
  // The model returns identifiedParts[] per the new schema. For each
  // part we (a) normalize its fields, (b) call attachVendorLinks() from
  // vendor-resolver.ts to populate per-part vendor URLs, (c) project
  // back to the legacy primaryPart/kitItems/consumables shape so the
  // existing VisionResultCard v1 keeps rendering unchanged.

  // Validate + normalize each raw part from the model.
  type RawPart = Partial<{
    id: string; role: string; category: string; name: string; spec: string;
    position: string; confidence: number; visibleInPhoto: boolean;
    brand: string; oemPartNumbers: string[];
    aftermarketPartNumbers: Array<{ brand: string; partNumber: string }>;
    searchQuery: string; estimatedPriceUsd: { low: number; high: number };
    notes: string;
  }>;
  const VALID_ROLES = new Set<PartRole>(['primary', 'consumable', 'fastener', 'related']);
  const VALID_CATS = new Set<PartCategory>([
    'rotor','brake_pad','caliper','tire','wheel','lug_nut','tpms','filter','fluid',
    'wiper','bulb','battery','spark_plug','sensor','belt','hose','suspension',
    'ignition','fuel_pump','alternator','starter','body_panel','trim','badge',
    'emblem','bracket','interior','accessory','tool','oem_specific','other',
  ]);
  const rawParts: RawPart[] = Array.isArray(parsed.identifiedParts) ? parsed.identifiedParts as RawPart[] : [];

  // Normalize each part. Drop entries without a name.
  const normalizedParts = rawParts
    .filter((p) => typeof p?.name === 'string' && p.name.trim().length > 0)
    .slice(0, 12) // cap at 12 parts to bound response size
    .map((p, i): Omit<IdentifiedPart, 'vendorLinks'> => {
      const role: PartRole = VALID_ROLES.has(p.role as PartRole) ? (p.role as PartRole) : 'primary';
      const category: PartCategory = VALID_CATS.has(p.category as PartCategory) ? (p.category as PartCategory) : 'other';
      const oemNums = Array.isArray(p.oemPartNumbers)
        ? p.oemPartNumbers.filter((n: unknown): n is string => typeof n === 'string' && n.trim().length > 0).slice(0, 6)
        : [];
      const aftermarket = Array.isArray(p.aftermarketPartNumbers)
        ? p.aftermarketPartNumbers.filter((x: { brand?: string; partNumber?: string } | unknown): x is { brand: string; partNumber: string } =>
            !!x && typeof x === 'object' && typeof (x as { brand?: string }).brand === 'string' && typeof (x as { partNumber?: string }).partNumber === 'string')
            .slice(0, 6)
        : undefined;
      return {
        id: typeof p.id === 'string' && p.id.trim() ? p.id : `p_${i}_${Math.random().toString(36).slice(2, 8)}`,
        role,
        category,
        name: p.name as string,
        spec: typeof p.spec === 'string' ? p.spec : undefined,
        position: typeof p.position === 'string' ? p.position : undefined,
        confidence: typeof p.confidence === 'number' ? Math.max(0, Math.min(1, p.confidence)) : 0.7,
        visibleInPhoto: p.visibleInPhoto !== false,
        brand: typeof p.brand === 'string' ? p.brand : undefined,
        oemPartNumbers: oemNums,
        aftermarketPartNumbers: aftermarket,
        estimatedPriceUsd: p.estimatedPriceUsd && typeof p.estimatedPriceUsd.low === 'number' && typeof p.estimatedPriceUsd.high === 'number'
          ? { low: p.estimatedPriceUsd.low, high: p.estimatedPriceUsd.high }
          : undefined,
        notes: typeof p.notes === 'string' ? p.notes : undefined,
        // searchQuery is consumed by the resolver — store on a side
        // channel via a hidden field so attachVendorLinks can read it.
        // We don't include it in the public IdentifiedPart type.
      };
    });

  // Attach per-part vendor links via the resolver.
  const identifiedParts: IdentifiedPart[] = attachVendorLinks(normalizedParts, vehicle ? { year: vehicle.year, make: vehicle.make, model: vehicle.model, trim: vehicle.trim } : undefined)
    .map((p, i) => ({
      ...p,
      vendorLinks: p.vendorLinks.length > 0 ? p.vendorLinks : (
        // Resolver returned no vendors (rare — e.g. a category with no
        // matching vendor catalog entry). Fall back to a single Amazon
        // search link so the user always has SOMETHING to click.
        [{
          vendor: 'amazon' as const,
          displayName: 'Amazon',
          url: `https://www.amazon.com/s?k=${encodeURIComponent((rawParts[i]?.searchQuery as string | undefined) || `${p.brand || ''} ${p.oemPartNumbers[0] || ''} ${p.name}`.trim())}&tag=au7o-20`,
          searchQuery: (rawParts[i]?.searchQuery as string | undefined) || p.name,
          linkType: 'search' as const,
          priority: 1,
        }]
      ),
    }));

  // Resolve primaryPartId: prefer the model's value, fall back to the
  // first role='primary' part. Null when no parts identified.
  const modelPrimaryId = typeof parsed.primaryPartId === 'string' ? parsed.primaryPartId : null;
  const primaryPartId: string | null = modelPrimaryId && identifiedParts.some((p) => p.id === modelPrimaryId)
    ? modelPrimaryId
    : (identifiedParts.find((p) => p.role === 'primary')?.id ?? null);

  // ─── Legacy projection ────────────────────────────────────────────
  // Existing VisionResultCard v1 reads primaryPart + kitItems +
  // consumables. Build them from identifiedParts so nothing breaks on
  // older clients (saved conversation replays, future mobile builds).
  const TAG = 'au7o-20';
  const amazonFallback = (it: IdentifiedPart): string | null => {
    const amazonLink = it.vendorLinks.find((v) => v.vendor === 'amazon');
    if (amazonLink) return amazonLink.url;
    const q = `${it.brand || ''} ${it.oemPartNumbers[0] || ''} ${it.name}`.trim();
    return q ? `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${TAG}` : null;
  };
  const legacyProject = (p: IdentifiedPart) => ({
    name: p.name,
    spec: p.spec || '',
    brand: p.brand || '',
    partNumber: p.oemPartNumbers[0] || p.aftermarketPartNumbers?.[0]?.partNumber || '',
    amazonUrl: amazonFallback(p),
  });
  const primaryPartLegacy = primaryPartId
    ? (identifiedParts.find((p) => p.id === primaryPartId) ? legacyProject(identifiedParts.find((p) => p.id === primaryPartId)!) : null)
    : null;
  const kitItemsLegacy = identifiedParts.filter((p) => p.role === 'fastener').map(legacyProject);
  const consumablesLegacy = identifiedParts.filter((p) => p.role === 'consumable').map(legacyProject);

  // Look up related known-issue rows.
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

  const validVehicleMatch = ['confident', 'uncertain', 'likely_mismatch'];
  const vehicleMatchRaw = String(parsed.vehicleMatch || 'uncertain').toLowerCase();
  const result = {
    schemaVersion: 2 as const,
    mode,
    transcript: audioTranscript || undefined,
    framesAnalyzed: mode === 'video' ? images.length : undefined,
    summary: String(parsed.summary || ''),
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    isCarRelated: parsed.isCarRelated !== false,
    vehicleMatch: (validVehicleMatch.includes(vehicleMatchRaw) ? vehicleMatchRaw : 'uncertain') as 'confident' | 'uncertain' | 'likely_mismatch',
    vehicleMatchNote: String(parsed.vehicleMatchNote || '').slice(0, 300),
    identifiedParts,
    primaryPartId,
    // Legacy shims so v1 renderer keeps working:
    primaryPart: primaryPartLegacy,
    kitItems: kitItemsLegacy,
    consumables: consumablesLegacy,
    toolsNeeded: Array.isArray(parsed.toolsNeeded) ? parsed.toolsNeeded.filter((t: unknown): t is string => typeof t === 'string') : [],
    difficulty: ['easy','medium','hard'].includes(String(parsed.difficulty)) ? parsed.difficulty as string : 'medium',
    estimatedTimeMinutes: typeof parsed.estimatedTimeMinutes === 'number' ? parsed.estimatedTimeMinutes : null,
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.filter((w: unknown): w is string => typeof w === 'string') : [],
    relatedIssues,
    quotaRemaining: quota.remaining,
    quotaResetAt: quota.resetAt.toISOString(),
  };

  vlog('result_shaped', {
    schemaVersion: result.schemaVersion,
    summaryLen: result.summary.length,
    summaryHead: result.summary.slice(0, 120),
    isCarRelated: result.isCarRelated,
    vehicleMatch: result.vehicleMatch,
    identifiedCount: result.identifiedParts.length,
    primaryRoleCount: result.identifiedParts.filter((p) => p.role === 'primary').length,
    categoriesSeen: result.identifiedParts.map((p) => p.category),
    vendorLinkTotal: result.identifiedParts.reduce((s, p) => s + p.vendorLinks.length, 0),
    primaryPartId: result.primaryPartId,
    legacyHasPrimary: !!result.primaryPart,
    relatedCount: result.relatedIssues.length,
  });

  return respond({ vision: result });
}
