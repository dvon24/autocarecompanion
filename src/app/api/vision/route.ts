import { NextRequest, NextResponse, after } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import {
  hubChatMinuteLimiter,
  getClientIp,
} from '@/lib/rate-limit';
import {
  checkAndConsumePhotoQuota,
  refundPhotoQuota,
  DEFAULT_FREE_PHOTO_LIMIT,
} from '@/lib/photo-quota';
import { checkAiGate, isAiGateBlocked } from '@/lib/ai-gate';
import { getVehicleSpecs } from '@/lib/maintenance';
import { attachVendorLinks } from '@/lib/vendor-resolver';
import { validateAndFixVendorLinks } from '@/lib/vendor-link-validator';
import { captureDiagnosisSample } from '@/lib/diagnosis-capture';
import { makeSlug } from '@/lib/known-issues';
import type { IdentifiedPart, PartCategory, PartRole } from '@/types/vision';

// 120s, not 60: video mode's sequential upstream budget (Whisper 25s +
// vision 55s + multipart/auth/DB overhead) could exceed a 60s ceiling, and
// when Vercel kills the function mid-flight failWithRefund never runs — the
// user eats an opaque 504 AND loses the photo credit (2026-06-11 review
// finding). 120s comfortably covers the worst-case sum so the route always
// answers (and refunds) itself.
export const maxDuration = 120;
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
 * Privacy: the uploaded image is processed in-memory and is NOT
 * stored — the vision model sees the base64 once and no copy is
 * persisted to disk or storage. Signed-in users who explicitly opt in
 * (Phase 0 visual dataset) have only low-PII DIAGNOSIS METADATA kept
 * (a PII-scrubbed summary + the diagnosed component + YMMT) via
 * captureDiagnosisSample — still no image bytes in this phase. GDPR
 * opt-out (aiProcessingOptOut) short-circuits before any API call.
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

  // Anonymous "try it free" is now enabled: 1 photo per IP per month
  // before the signup gate fires. The /diagnose flow is the primary
  // entry point for this — give visitors one real magic-moment so they
  // understand what they're signing up for. After that one credit, all
  // anon attempts get bounced with a login CTA (same response shape
  // the existing client gate cards already handle).
  let session;
  try { session = await auth(); } catch { session = null; }
  vlog('auth_done', { authed: !!session?.user?.id });

  const userId: string | null = session?.user?.id ?? null;
  const isSubscriber = !!session && session.user.subscriptionStatus === 'active';

  // Burst protection — applies to everyone.
  const ip = getClientIp(request);
  const burst = hubChatMinuteLimiter.check(ip);
  if (!burst.success) {
    vlog('burst_blocked');
    // Route through respond() so this carries x-au7o-req-id + the 'responded'
    // log line, and ship a friendly, client-recognizable shape (gated:false,
    // a message, Retry-After) instead of the raw {error:'Too many requests'}
    // that fell into the client's generic "HTTP 429" dead-end.
    return respond({
      error: 'rate_limited',
      message: "One moment — you're sending photos very fast. Try again in a few seconds.",
      retryAfter: burst.reset,
      gated: false,
    }, { status: 429, headers: { 'Retry-After': String(burst.reset) } });
  }

  // Quota: anon = 1/mo per IP, free authed = 3/mo, Plus = 40/mo (the
  // advertised "10/week" on a monthly window so it reuses the existing
  // quota machinery), Pro = effectively unlimited. Previously EVERY active
  // subscriber got the unlimited cap — the tier was never read, so $14.99
  // Plus customers received the headline feature the $24.99 Pro tier is
  // sold on (2026-06-12 review finding). checkAndConsumePhotoQuota
  // CONSUMES one credit immediately — every failure path below must
  // refundPhotoQuota(quotaKey) before returning so users don't lose a
  // credit to a server error.
  const ANON_FREE_PHOTO_LIMIT = 1;
  const PLUS_MONTHLY_CAP = 40;
  let limit = ANON_FREE_PHOTO_LIMIT;
  let subscriptionTier: string | null = null;
  if (userId) {
    if (isSubscriber) {
      // The session JWT only carries subscriptionStatus, so resolve the
      // tier with one indexed read. Unknown/legacy tier defaults to the
      // generous cap rather than punishing grandfathered subscribers.
      try {
        const u = await prisma.user.findUnique({ where: { id: userId }, select: { subscriptionTier: true } });
        subscriptionTier = u?.subscriptionTier ?? null;
      } catch { /* fall through to unlimited */ }
      limit = subscriptionTier === 'plus' ? PLUS_MONTHLY_CAP : SUBSCRIBER_MONTHLY_CAP;
    } else {
      limit = DEFAULT_FREE_PHOTO_LIMIT;
    }
  }
  // Multi-photo (several angles of the SAME issue in one diagnosis) is a Pro
  // perk — more angles = better vision accuracy. Free/anon and Plus get a
  // single image; the top subscriber tier (Pro) can send several. Unknown/
  // legacy subscriber tiers count as Pro so grandfathered users aren't
  // punished. Plus = 'plus'; Pro = anything else with an active sub.
  const multiPhotoAllowed = isSubscriber && subscriptionTier !== 'plus';
  const MAX_PHOTOS = 5;
  const quotaKey = userId ? `photo:user:${userId}` : `photo:anon:${ip}`;
  const quota = await checkAndConsumePhotoQuota({ key: quotaKey, limit });
  vlog('quota_checked', { allowed: quota.allowed, remaining: quota.remaining, anon: !userId });
  if (!quota.allowed) {
    // Anonymous gates route to signup; authed gates route to upgrade.
    if (!userId) {
      return respond({
        error: 'login_required',
        message: 'You\'ve used your free diagnosis. Sign up free to keep going.',
        resetAt: quota.resetAt.toISOString(),
        remaining: 0,
        limit,
        gated: true,
        ctaUrl: '/auth/signup',
        ctaLabel: 'Sign up free',
        secondaryCtaUrl: '/auth/signin',
        secondaryCtaLabel: 'Sign in',
      }, { status: 401 });
    }
    return respond({
      error: 'quota_exceeded',
      message: `You've used your ${DEFAULT_FREE_PHOTO_LIMIT} free photo analyses this month. Go unlimited with Au7o Pro.`,
      resetAt: quota.resetAt.toISOString(),
      remaining: 0,
      limit,
      gated: true,
      ctaUrl: '/account',
      ctaLabel: 'Go unlimited — from $14.99/mo',
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
  // True when a non-Pro user sent multiple photos and we dropped the extras
  // — surfaced in the response so the client can show a Pro upsell.
  let multiPhotoCapped = false;

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
    // Multi-photo: accept every `image` part. Non-Pro users get only their
    // first photo (the rest are silently dropped + flagged for an upsell);
    // Pro users get up to MAX_PHOTOS angles fed into one diagnosis.
    const imageFiles = form.getAll('image').filter((f): f is File => f instanceof File);
    if (imageFiles.length === 0) {
      return failWithRefund({ error: 'missing_image' }, 400);
    }
    multiPhotoCapped = imageFiles.length > 1 && !multiPhotoAllowed;
    const chosen = multiPhotoAllowed ? imageFiles.slice(0, MAX_PHOTOS) : imageFiles.slice(0, 1);
    for (const f of chosen) {
      if (f.size > MAX_IMAGE_BYTES) {
        return failWithRefund({ error: 'image_too_large', message: 'Image must be 10MB or smaller. Try a lower-quality phone setting or crop tighter.' }, 413);
      }
      if (!/^image\/(jpe?g|png|webp|gif)$/i.test(f.type || '')) {
        return failWithRefund({ error: 'unsupported_type', message: 'Use a JPEG, PNG, or WebP image. iPhone HEIC photos: enable "Most Compatible" in Settings → Camera → Formats, then try again.' }, 415);
      }
    }
    images = chosen;
  }

  let vehicle: VehicleCtx | null = null;
  try {
    const raw = form.get('vehicle');
    if (typeof raw === 'string') vehicle = JSON.parse(raw);
  } catch { /* fall through; vehicle is optional but encouraged */ }

  const caption = (form.get('caption') as string | null) || '';

  // Output language. The client passes the user's language (navigator.language
  // or the locale they're browsing) so a German/French/etc. user gets the
  // diagnosis IN their language — not English. Defaults to English. Only the
  // natural-language text is translated; enums + part numbers + codes stay
  // English machine values (see the LANGUAGE block in the prompt).
  const LANG_NAMES: Record<string, string> = {
    en: 'English', de: 'German', fr: 'French', es: 'Spanish', pt: 'Portuguese',
    it: 'Italian', nl: 'Dutch', pl: 'Polish', sv: 'Swedish', da: 'Danish',
    cs: 'Czech', tr: 'Turkish', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ru: 'Russian',
  };
  const langRaw = ((form.get('lang') as string | null) || 'en').toLowerCase();
  const langKey = langRaw.startsWith('pt') ? 'pt' : langRaw.split('-')[0];
  const respondLang = LANG_NAMES[langKey] || 'English';

  // Visual data flywheel (Phase 0) consent signal. '1' = opt-in this
  // upload, '0' = explicit decline this upload (authoritative — overrides
  // the account-level opt-in), absent = no per-upload checkbox was shown
  // (fall back to User.visualDatasetOptIn server-side).
  const keepPhotoRaw = form.get('keepPhoto');
  const perUploadConsent: '1' | '0' | null =
    keepPhotoRaw === '1' ? '1' : keepPhotoRaw === '0' ? '0' : null;

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
  // The first photo's buffer is retained for the (consent-gated) Phase 0.1
  // capture below; everything else stays in-memory only.
  const dataUrls: string[] = [];
  let totalBytes = 0;
  let firstImage: { buffer: Buffer; contentType: string } | null = null;
  for (const img of images) {
    const buf = Buffer.from(await img.arrayBuffer());
    totalBytes += buf.length;
    if (!firstImage) firstImage = { buffer: buf, contentType: img.type };
    dataUrls.push(`data:${img.type};base64,${buf.toString('base64')}`);
  }
  vlog('buffer_built', { count: dataUrls.length, totalBytes });

  // Load context: known issues + cached parts for this vehicle, so the
  // vision model's answer is grounded in YMMT-specific knowledge.
  // Cheap parallel reads.
  let knownIssuesContext = '';
  let cachedPartsContext = '';
  let specsContext = '';
  let dtcContext = '';
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
          select: { id: true, title: true, category: true, severity: true, symptoms: true, dtcCodes: true },
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
        // Fluid specs — so a coolant/ATF/brake-fluid bottle photo can be
        // matched against the SPEC this vehicle actually takes (the model was
        // punting "what's the part number?" because it had nothing to compare).
        if (specs.coolant?.type) lines.push(`Coolant: ${specs.coolant.type}`);
        if (specs.brakeFluid?.type) lines.push(`Brake fluid: ${specs.brakeFluid.type}`);
        if (specs.transmission?.type) lines.push(`Transmission fluid: ${specs.transmission.type}`);
        if (lines.length > 0) specsContext = `\n\nVEHICLE SPECS:\n${lines.join('\n')}`;
      }

      // DTC grounding: pull the reference NAMES for the trouble codes our own
      // known issues cite for this vehicle, so the model names real, correct
      // codes (and our /dtc/[code] pages) instead of guessing.
      const issueCodes = Array.from(new Set(
        issues.flatMap(i => (Array.isArray(i.dtcCodes) ? i.dtcCodes : [])).map(c => String(c).toUpperCase().trim()).filter(Boolean)
      )).slice(0, 10);
      if (issueCodes.length > 0) {
        const dtcRows = await prisma.dTCCode.findMany({
          where: { code: { in: issueCodes } },
          select: { code: true, name: true },
        });
        const nameByCode = new Map(dtcRows.map(d => [d.code.toUpperCase(), d.name]));
        const dtcLines = issueCodes.map(c => (nameByCode.has(c) ? `${c} — ${nameByCode.get(c)}` : c));
        dtcContext = `\n\nDTC CODES commonly tied to this vehicle (if the photo/symptoms match one, name the exact code):\n${dtcLines.join('\n')}`;
      }
    } catch (err) {
      vlog('prisma_context_failed', { err: err instanceof Error ? err.message : String(err) });
      /* non-blocking — vision still answers without context */
    }
  }
  vlog('prisma_context_done');

  const vehicleDesc = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}` : 'unknown vehicle';

  const SYSTEM_PROMPT = `You are an expert automotive technician analyzing a photo from a vehicle owner.

Vehicle: ${vehicleDesc}.${specsContext}${knownIssuesContext}${dtcContext}${cachedPartsContext}

${mode === 'video'
  ? `INPUT MODE: VIDEO — you are seeing ${images.length} frames sampled evenly across a short video clip the user uploaded. Look across the frames for symptoms that change over time: rotor pulsing under braking, fluid drip, dashboard warning light flicker, belt slap, smoke. CRITICAL: a video does NOT let you see more detail than a photo — it just adds motion. If no symptom is clearly visible across the frames, report the area as normal. Do NOT invent a defect (e.g. a sidewall bulge, a leak) just because the input is a video; a healthy part must read "ok" whether it's a photo or a video of the same scene. Frame 1 is earliest, frame ${images.length} is latest. The frames are NOT separate photos of separate parts — they're moments of the SAME scene.${audioTranscript ? `\n\nAUDIO TRANSCRIPT (Whisper) from the same clip: "${audioTranscript}"\nUse this as additional context — the user's spoken complaint correlates with what you should look for visually. If the transcript mentions a noise ("clicking", "grinding", "whining"), call that out in the summary and weight your part identification toward the likely source.` : ''}`
  : images.length > 1
    ? `INPUT MODE: PHOTO — ${images.length} still photos of the SAME issue from DIFFERENT ANGLES/distances the user took to help you see it clearly. They are NOT separate parts or separate problems — combine what you see across all ${images.length} images into ONE diagnosis, using whichever angle shows each detail best (e.g. one shot for the part, another for the wear/leak). Cross-check the angles to raise your confidence.`
    : `INPUT MODE: PHOTO — single still image.`}

User's typed description (may be empty): ${caption || '(none provided)'}

DIAGNOSTIC HONESTY — THIS OVERRIDES EVERY INSTRUCTION BELOW:
A photo shows APPEARANCE, not measurements. You are reporting only what is CLEARLY
VISIBLE in the pixels — you are NOT a substitute for a hands-on inspection. A
confident wrong call on a safety part (telling someone their good tires are bald,
or inventing a sidewall bulge that isn't there) is a SERIOUS failure: it costs the
user money, erodes trust, and is just as harmful as missing a real defect.
- DEFAULT every part's condition to "ok" (or "info" for a mere ID like a badge).
  Only use "warn"/"critical" when you can point to a SPECIFIC defect VISIBLE in the
  image, and the "finding" MUST name that visible evidence (e.g. "cords showing
  through tread", "pad ~2mm at backing plate", "sidewall visibly split"). If you
  cannot describe the visible evidence, it is NOT warn/critical.
- Do NOT infer a defect from the TYPE of part. A tire is not "worn" just because
  it's a tire. If nothing looks wrong, say it looks serviceable.
- Returning condition "ok" / urgency "monitor" with "No visible issues — looks
  serviceable in these images" is a SUCCESS, not a failure. Say it often.
- The SAME scene must read the same whether it's a photo or a video. Do not
  escalate a finding just because the input is a video.

TIRES & WHEELS — you usually CANNOT judge these from a photo, so be especially careful:
- Tread depth: a photo gives no MEASUREMENT, but the WEAR BARS give a real read. Wear
  bars are the small raised rubber bridges molded across the bottom of the grooves.
  Read them: if the tread blocks are worn DOWN LEVEL/FLUSH with the wear bars (or
  cord/canvas shows, or the tread is slick), the tire is at its limit — flag it
  (warn/critical, finding e.g. "Tread flush with wear bars"). If there is CLEARLY
  tread standing above the wear bars, it's serviceable — condition "ok", finding
  "Good tread above the wear bars". If the angle or lighting won't let you see the
  wear bars to judge, do NOT guess a verdict — set "ok"/"info" and COACH the user in
  the finding: "Can't read tread from this angle — do the penny test or reshoot
  straight into a groove." NEVER state a measured depth (e.g. "4/32 inch") — you
  cannot measure it from an image.
- Sidewall bulge/bubble: only when the sidewall is CLEARLY deformed/distended in the
  image. A normal curved sidewall is NOT a bulge. Do not invent one.
- Dry rot, fender rubbing, alignment wear: only if the visible evidence is actually
  in frame. Do not speculate.

SCALE REFERENCE — the ONLY way to give a real measurement from a flat photo (inherits the
honesty rules above: only when the evidence is actually in frame):
- If a KNOWN-SIZE everyday object is visible IN THE SAME PLANE as the part and shot roughly
  straight-on, use it as a pixel-per-mm ruler to estimate IN-PLANE sizes (panel-gap width,
  rust-hole / dent diameter, exposed brake-pad friction height). Reference sizes: US quarter
  = 24.26mm dia, US penny = 19.05mm dia, US nickel = 21.21mm dia, standard credit/ID card =
  85.6 x 54.0mm. Report the size as a RANGE with an honest band (e.g. "rust hole ~25-30mm")
  and name the reference you used. If the object is off-axis, not coplanar with the part, or
  you're unsure, do NOT state a measurement — say what's needed ("lay a quarter flat next to
  it and reshoot straight-on for a real size").
- TREAD via coin-in-groove (operationalizes the penny test): if a coin is stood upright INTO a
  tread groove, shot straight into the groove, read how much of the coin the tread hides and
  return a PASS/FAIL threshold (NOT a continuous mm): PENNY with Lincoln's head pointing in —
  if the tread reaches/buries the top of his head, tread is roughly >1.6mm (legal-min, replace
  soon); if you can see the space above his head, it's at/below the limit (warn/critical).
  QUARTER with Washington's head in — tread reaching the top of his head ≈ >3.2mm (healthy).
  State which coin and which band; never invent a mm number from a coin.
- NEVER fabricate a reference that isn't visible, and NEVER state a measured value without one.

FLUIDS (coolant, oil, ATF, brake/power-steering/washer fluid) — when a fluid CONTAINER or
fill point is the subject of the photo, this is a BUYABLE item, not a deferral:
- READ THE LABEL: brand, product line, and the printed spec/standard (e.g. "Dex-Cool",
  "OAT 50/50", "HOAT/G-05", "VW G13", "5W-30 full synthetic", "DOT 4", "ATF WS/Mercon LV").
- Return it as a part: category "fluid", visibleInPhoto:true, role "primary" (the user wants
  to buy/verify it). oemPartNumbers MUST be [] — fluids are bought by SPEC, not a part number;
  an empty array here is EXPECTED, not a failure.
- Put a concrete, buyable searchQuery of brand + product line + size, e.g.
  "Prestone Dex-Cool 50/50 antifreeze 1 gallon" or "Valvoline 5W-30 full synthetic 5 quart".
  If you can't read a brand, build the query from the SPEC the vehicle needs (see VEHICLE SPECS
  above), e.g. "Toyota Super Long Life Coolant pink 1 gallon".
- If the caption asks "is this the right X", COMPARE the label to the matching VEHICLE SPECS
  line above and state in the summary whether it matches (e.g. "Yes — that's a Dex-Cool OAT
  coolant, which is what your vehicle takes" or "That's a green IAT coolant, but your vehicle
  needs Dex-Cool OAT — not a match").
- NEVER ask the user for a part number for a fluid. Identify it by spec.

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
     - box — the part's location IN the photo as { "x", "y", "w", "h" } in PERCENTAGES of image width/height (0-100, origin top-left): the tightest box around the part. ONLY for parts visibleInPhoto:true. Be accurate — these draw pins on the user's actual photo, so a wrong box looks broken.
     - condition — DEFAULT "ok". Use "warn"/"critical" ONLY with a visible defect you can name (see DIAGNOSTIC HONESTY above): "ok" (looks healthy/serviceable), "warn" (a VISIBLE early/aging defect), "critical" (a VISIBLE failure — do not drive), "info" (just identified, e.g. a trim badge). When unsure, "ok" or "info", never "warn".
     - finding — a SHORT phrase for the callout (≤7 words). For "ok" describe what looks fine ("Pads healthy · no fluid weeping", "Tread looks serviceable"). For "warn"/"critical" it MUST name the visible evidence ("Cords showing through tread"). Do NOT state a measured value (e.g. "4/32\\" tread") you cannot actually measure from an image.
5. Set primaryPartId to the id of the part the user most likely came for. For a wheel photo where the user might want any of rotor/pads/tire, pick the most expensive/important one (usually the rotor). The other identified parts stay in identifiedParts.
6. Cross-reference the KNOWN ISSUES list above. If any identified part matches a documented issue for this vehicle, list the issue id in relatedKnownIssueIds.
7. Difficulty: easy / medium / hard. Estimated DIY time. Safety warnings if any.
8. urgency — classify how soon this needs attention, for a driver who may know nothing about cars:
     - "stop_driving" = safety-critical; driving risks a crash or major damage (bald/cord-showing tires, brake failure, steering/suspension separation, active fluid loss that strands or overheats, fire risk).
     - "fix_soon" = drivable carefully short-term but degrades or gets costly if ignored (worn-but-not-gone pads, a seeping leak, a failing-but-working component).
     - "monitor" = no immediate danger; address at next service (cosmetic, early wear, minor weep).
   Base urgency on VISIBLE evidence, not on caution-as-default. If you cannot SEE a defect, urgency is "monitor" (or leave the part "ok"). Never downplay a genuine, visible safety risk — and never INVENT one "to be safe". A false "stop driving" on a healthy car is its own harm.
   CONSISTENCY: urgency must agree with the WORST part condition you reported. If ANY part is
   "critical", urgency CANNOT be "monitor" — use "stop_driving", or "fix_soon" only if it's
   genuinely drivable short-term. If any part is "warn", urgency is at least "fix_soon". A green
   "monitor" verdict requires every part to be "ok"/"info".

EXAMPLE — user uploads a photo of a Challenger SRT front wheel showing rim, tire sidewall, lug nuts, brake caliper through spokes, and rotor face. identifiedParts should contain:
- rotor (role:primary, category:rotor, OEM 68249841AA, searchQuery:'Mopar 68249841AA Challenger SRT front rotor', visibleInPhoto:true)
- brake pads (role:primary, category:brake_pad, OEM 68389062AA, visibleInPhoto:true)
- caliper (role:primary, category:caliper, OEM 68144181AA, visibleInPhoto:true)
- tire (role:primary, category:tire, searchQuery includes size like '275/40R20', visibleInPhoto:true)
- wheel/rim (role:primary, category:wheel, visibleInPhoto:true)
- lug nuts (role:fastener, category:lug_nut, OEM 6036432AA, visibleInPhoto:true)
- brake fluid (role:consumable, category:fluid, visibleInPhoto:false — needed for the job)
Seven entries, not one.

${respondLang !== 'English' ? `LANGUAGE — IMPORTANT: The user speaks ${respondLang}. Write ALL human-readable text in ${respondLang}: the "summary", each part's "name"/"spec"/"finding"/"notes", and every "warnings" string. Do NOT translate (keep EXACTLY as given): the JSON keys; the enum values for role, category, condition, urgency, vehicleMatch; part numbers; DTC codes; brand names. Only natural-language sentences get translated.

` : ''}Return ONLY a JSON object — no markdown fences, no preamble. Start with { end with }. Schema:
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
      "notes": "Replace as axle pair — never one side only.",
      "box": {"x": 40, "y": 38, "w": 34, "h": 30},
      "condition": "ok",
      "finding": "Surface smooth · no deep scoring"
    }
  ],
  "toolsNeeded": ["..."],
  "difficulty": "easy"|"medium"|"hard",
  "estimatedTimeMinutes": 30,
  "urgency": "stop_driving"|"fix_soon"|"monitor",
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

  // The PHOTO path gets ONE retry on a transient upstream failure (network error
  // or 429/5xx) — a single OpenAI blip otherwise burns the user's whole
  // magic-moment diagnosis. Video is excluded: Whisper(25s)+vision(55s)+a retry
  // could exceed the 120s function ceiling. Never retry a 4xx (deterministic) or
  // a content refusal. Two photo attempts use a shorter per-attempt timeout so
  // they comfortably fit maxDuration.
  const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
  const maxAttempts = mode === 'photo' ? 2 : 1;
  const perAttemptTimeout = maxAttempts > 1 ? 40_000 : 55_000;
  let openaiResp: Response | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    vlog('openai_fetch_start', { model: MODEL, attempt });
    try {
      const r = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify(openaiBody),
        signal: AbortSignal.timeout(perAttemptTimeout),
      });
      vlog('openai_headers_received', { status: r.status, attempt });
      if (r.ok) { openaiResp = r; break; }
      const txt = await r.text().catch(() => '');
      console.error('[vision] OpenAI', r.status, 'model=', MODEL, 'attempt=', attempt, 'body=', txt.slice(0, 500));
      if (RETRYABLE_STATUS.has(r.status) && attempt < maxAttempts) {
        vlog('openai_retry', { status: r.status });
        await new Promise((res) => setTimeout(res, 600));
        continue;
      }
      // Log upstream body server-side only; don't leak OAI internal error text.
      return failWithRefund({
        error: 'vision_failed',
        message: `Photo analysis failed (upstream HTTP ${r.status}). Try a clearer photo or different angle.`,
        upstreamStatus: r.status,
      }, 502);
    } catch (err) {
      console.error('[vision] OpenAI fetch failed (attempt', attempt, '):', err);
      if (attempt < maxAttempts) {
        vlog('openai_retry', { reason: 'network' });
        await new Promise((res) => setTimeout(res, 600));
        continue;
      }
      return failWithRefund({ error: 'vision_failed', message: 'Photo analysis temporarily unavailable. Try again in a moment.' }, 502);
    }
  }
  if (!openaiResp) {
    // Loop always returns on terminal failure; this satisfies the type checker.
    return failWithRefund({ error: 'vision_failed', message: 'Photo analysis temporarily unavailable. Try again in a moment.' }, 502);
  }

  let data;
  try {
    data = await openaiResp.json();
  } catch (err) {
    // A 200 with an unparseable body still has to refund — this throw
    // previously escaped to a generic 500 with the credit kept.
    console.error('[vision] OpenAI response JSON parse failed:', err);
    return failWithRefund({ error: 'vision_failed', message: 'Photo analysis returned an unreadable response. Please try again.' }, 502);
  }
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
    box: { x: number; y: number; w: number; h: number };
    condition: string; finding: string;
  }>;
  const VALID_ROLES = new Set<PartRole>(['primary', 'consumable', 'fastener', 'related']);
  const VALID_CATS = new Set<PartCategory>([
    'rotor','brake_pad','caliper','tire','wheel','lug_nut','tpms','filter','fluid',
    'wiper','bulb','battery','spark_plug','sensor','belt','hose','suspension',
    'ignition','fuel_pump','alternator','starter','body_panel','trim','badge',
    'emblem','bracket','interior','accessory','tool','oem_specific','other',
  ]);
  // Enforce the "non-car photo → no parts" invariant. The prompt asks the model
  // to return identifiedParts=[] when isCarRelated is false, but it doesn't
  // always comply; a stray speculative part would otherwise render a buyable
  // card that contradicts the "not a vehicle part" summary.
  const isCarRelated = parsed.isCarRelated !== false;
  const rawParts: RawPart[] = (isCarRelated && Array.isArray(parsed.identifiedParts)) ? parsed.identifiedParts as RawPart[] : [];

  // Map the model's condition to our 4-token enum, tolerating natural-language
  // synonyms. A healthy part the model labels "good"/"serviceable" should still
  // render as a green "ok" rather than being silently dropped to a neutral pin —
  // that would undercut the honesty guardrail that makes "looks fine" a
  // first-class, visible outcome.
  const CONDITION_SYNONYMS: Record<string, 'ok' | 'warn' | 'critical' | 'info'> = {
    ok: 'ok', good: 'ok', healthy: 'ok', serviceable: 'ok', normal: 'ok', fine: 'ok', pass: 'ok',
    warn: 'warn', warning: 'warn', worn: 'warn', aging: 'warn', marginal: 'warn', caution: 'warn',
    critical: 'critical', failed: 'critical', failure: 'critical', unsafe: 'critical', bad: 'critical',
    info: 'info', identified: 'info', id: 'info', seen: 'info',
  };
  const normalizeCondition = (c: unknown): 'ok' | 'warn' | 'critical' | 'info' | undefined =>
    CONDITION_SYNONYMS[String(c ?? '').toLowerCase().trim()] ?? undefined;

  // Normalize each part. Drop entries without a name.
  const normalizedParts = rawParts
    .filter((p) => typeof p?.name === 'string' && p.name.trim().length > 0)
    .slice(0, 12) // cap at 12 parts to bound response size
    .map((p, i): Omit<IdentifiedPart, 'vendorLinks'> & { searchQuery?: string } => {
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
        // Annotated-pin fields. box = location in the photo (image %),
        // clamped 0-100; only kept when present + visible. condition +
        // finding drive the pin color and callout status line.
        box: p.box && [p.box.x, p.box.y, p.box.w, p.box.h].every((n) => typeof n === 'number')
          ? {
              x: Math.max(0, Math.min(100, p.box.x)),
              y: Math.max(0, Math.min(100, p.box.y)),
              w: Math.max(1, Math.min(100, p.box.w)),
              h: Math.max(1, Math.min(100, p.box.h)),
            }
          : undefined,
        condition: normalizeCondition(p.condition),
        finding: typeof p.finding === 'string' ? p.finding.slice(0, 120) : undefined,
        // Carry the model's purpose-built retailer query through to the resolver.
        // (This was previously dropped — a "side channel" the code never actually
        // wired up — so fluid/badge links fell back to the bare part name. The
        // resolver reads this and prefers it over [brand, oem, name].)
        searchQuery: typeof p.searchQuery === 'string' && p.searchQuery.trim() ? p.searchQuery.trim() : undefined,
      };
    });

  // Attach per-part vendor links via the resolver.
  const linkedParts: IdentifiedPart[] = attachVendorLinks(normalizedParts, vehicle ? { year: vehicle.year, make: vehicle.make, model: vehicle.model, trim: vehicle.trim } : undefined)
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

  // Validate the constructed deep links so we never hand the user a 404
  // (Devon hit a dead Tire Rack link from a tire photo). Confirmed-dead PDP
  // links fall back to the vendor's search tier. Never throws / never blocks
  // the response beyond its own short timeout; on any error we ship the
  // unvalidated links rather than fail the diagnosis.
  let identifiedParts: IdentifiedPart[] = linkedParts;
  try {
    identifiedParts = await validateAndFixVendorLinks(linkedParts);
  } catch {
    identifiedParts = linkedParts;
  }

  // Vehicle mismatch: when the model flags the photo as likely from a DIFFERENT
  // vehicle than the one the user is viewing, don't hand them buy-it-now links
  // for wrong-fitment parts. Keep the parts for identification but strip the
  // vendor links (the card shows a "switch vehicle before buying" banner above).
  const isLikelyMismatch = String(parsed.vehicleMatch || '').toLowerCase() === 'likely_mismatch';
  if (isLikelyMismatch) {
    identifiedParts = identifiedParts.map((p) => ({ ...p, vendorLinks: [] }));
  }

  // Resolve primaryPartId: prefer the model's value, fall back to the
  // first role='primary' part. Null when no parts identified — and always
  // null on a likely mismatch (don't auto-promote a wrong-vehicle part).
  const modelPrimaryId = typeof parsed.primaryPartId === 'string' ? parsed.primaryPartId : null;
  const primaryPartId: string | null = isLikelyMismatch
    ? null
    : (modelPrimaryId && identifiedParts.some((p) => p.id === modelPrimaryId)
      ? modelPrimaryId
      : (identifiedParts.find((p) => p.role === 'primary')?.id ?? null));

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
  let relatedIssues: Array<{ id: string; title: string; severity: string; url?: string }> = [];
  if (relatedIssueIds.length > 0) {
    try {
      const rows = await prisma.knownIssue.findMany({
        where: { id: { in: relatedIssueIds }, status: 'published' },
        select: { id: true, title: true, severity: true, make: true, model: true },
      });
      // Build a REAL destination URL so the "related known issues" links work on
      // the /diagnose + mobile-snap surfaces (a bare #id anchor resolves to
      // nothing there). Points at the public article page + the issue's anchor.
      relatedIssues = rows.map((r) => ({
        id: r.id,
        title: r.title,
        severity: r.severity,
        url: `/known-issues/${makeSlug(r.make, r.model)}#${r.id}`,
      }));
    } catch { /* silent */ }
  }

  const validVehicleMatch = ['confident', 'uncertain', 'likely_mismatch'];
  const vehicleMatchRaw = String(parsed.vehicleMatch || 'uncertain').toLowerCase();
  const result = {
    schemaVersion: 2 as const,
    mode,
    transcript: audioTranscript || undefined,
    framesAnalyzed: mode === 'video' ? images.length : undefined,
    // Multi-photo (Pro): how many angles were analyzed, and whether we had
    // to drop extras because the user isn't on Pro (drives the upsell).
    photosAnalyzed: mode === 'photo' ? images.length : undefined,
    multiPhotoCapped,
    summary: String(parsed.summary || ''),
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    isCarRelated,
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
    // Traffic-light urgency for the hero banner. Only pass through valid
    // values; the renderer derives a conservative fallback when absent.
    urgency: ['stop_driving','fix_soon','monitor'].includes(String(parsed.urgency)) ? parsed.urgency as string : undefined,
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

  // ─── Phase 0: consented visual-dataset capture (metadata only) ─────
  // Runs AFTER the response is sent (via after()) so it can never delay
  // or fail the diagnosis, and so opt-in status can never influence the
  // answer the user gets (keeps consent "freely given"). Gated to
  // signed-in PHOTO diagnoses of a car-related subject that is plausibly
  // the user's own vehicle; the consent decision itself lives inside
  // captureDiagnosisSample. Phase 0.0 persists NO image bytes.
  if (userId && mode === 'photo' && result.isCarRelated && result.vehicleMatch !== 'likely_mismatch') {
    const captureUserId = userId;
    const captureImage = firstImage; // Phase 0.1 — stored only if consent passes
    after(async () => {
      try {
        await captureDiagnosisSample({ userId: captureUserId, perUploadConsent, vehicle, mode, result, image: captureImage });
      } catch (err) {
        vlog('capture_failed', { err: err instanceof Error ? err.message : String(err) });
      }
    });
  }

  return respond({ vision: result });
}
