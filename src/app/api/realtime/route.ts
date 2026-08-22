import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hubChatMinuteLimiter, getClientIp, rateLimitResponse, voiceDemoAnonLimiter, voiceDemoFreeLimiter } from '@/lib/rate-limit';
import { peekVoiceDemo, consumeVoiceDemo, voiceDemoKey } from '@/lib/voice-demo-quota';

export const runtime = 'nodejs';

/**
 * POST /api/realtime — mint a SHORT-LIVED ephemeral OpenAI Realtime session
 * token so the browser can open a WebRTC voice session directly to OpenAI
 * WITHOUT the real API key ever reaching the client.
 *
 * This powers the "Live AI Mechanic" voice layer (talk to it while pointing the
 * camera). Realtime audio is EXPENSIVE per minute, so it is TIERED:
 *   - Plus/Pro (active subscriber) → FULL voice (tier:'full').
 *   - Anonymous + signed-in FREE → a short, hard-capped DEMO (tier:'demo',
 *     maxSeconds), then an upsell. Anon = the signup hook; free = the upgrade
 *     hook. Demo is capped per IP (anon) / per user (free) so the cost of the
 *     give-away is bounded.
 *   - burst rate-limited per IP on top.
 *
 * Returns { client_secret, model, expires_at, tier, maxSeconds, upsell }. The
 * client uses client_secret as the Bearer for the WebRTC SDP exchange; it
 * expires in ~60s (the handshake window — the live session continues after).
 */
const OPENAI_KEY = process.env.OPENAI_API_KEY;
// Default to gpt-realtime-2.1 (25% p95 latency cut + better alphanumeric
// recognition — matters because the mechanic reads PART NUMBERS aloud). Set
// OPENAI_REALTIME_MODEL in Vercel to override (e.g. 'gpt-realtime-2.1-mini'
// for cheaper demo-tier sessions, or 'gpt-realtime' to roll back).
const REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2.1';
const REALTIME_VOICE = process.env.OPENAI_REALTIME_VOICE || 'verse';

// Length of the free live-voice taste for non-payers. Short by design — long
// enough to hear the greeting + one exchange (the "wow"), tight enough that the
// give-away cost stays tiny. The client counts down and auto-ends at this mark.
const DEMO_SECONDS = 40;
// Must mirror the ceilings on voiceDemoAnonLimiter / voiceDemoFreeLimiter —
// these are the numbers the DURABLE (DB-backed) demo counter enforces.
const DEMO_ANON_LIMIT = 1;
const DEMO_FREE_LIMIT = 2;
// The mint API has no session-duration parameter, so DEMO_SECONDS cannot be
// enforced server-side; a client that ignores the countdown keeps talking until
// OpenAI's own session ceiling. Capping demo output tokens bounds what that
// costs us, and the durable per-identity demo counter bounds how often it can
// be re-obtained. Removing the client-trust entirely needs a session-duration
// control OpenAI does not currently expose at mint time.
const DEMO_MAX_OUTPUT_TOKENS = 1500;

type Upsell = { message: string; ctaUrl: string; ctaLabel: string };
const ANON_UPSELL: Upsell = { message: 'Free voice preview complete. Browse known issues for your vehicle.', ctaUrl: '/known-issues', ctaLabel: 'Browse known issues' };
const FREE_UPSELL: Upsell = { message: 'Upgrade to Plus for unlimited live voice with the mechanic.', ctaUrl: '/subscribe', ctaLabel: 'Upgrade to Plus' };

interface VehicleCtx { year?: number; make?: string; model?: string; trim?: string }

/**
 * Drive copilot ("Jarvis in the map"): hands-free, safety-first, PROACTIVE.
 * The live route/fuel/hazard context is streamed from the client over the data
 * channel during the drive; these are the standing instructions.
 */
function buildDriveInstructions(vehicle: VehicleCtx | null, lang?: string): string {
  const v = vehicle && vehicle.make ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model || ''}${vehicle.trim ? ' ' + vehicle.trim : ''}`.trim() : null;
  const language = (lang || '').trim();
  return [
    'You are Au7o, a calm, sharp in-car driving copilot — think Jarvis from Iron Man, but for the road. The user is DRIVING and cannot look at a screen. Safety is the absolute priority: everything you say is brief, glanceable-by-ear, and never distracting.',
    v ? `Their vehicle: ${v}. You know its common issues and maintenance.` : null,
    'You periodically receive DRIVE CONTEXT updates (a system/user message) with the live situation: location, speed, ETA, distance and time remaining, fuel range if available, the next turn, nearby gas stations, speed cameras, hazards, weather, and any car alert. ALWAYS ground what you say in the MOST RECENT context; ignore stale numbers.',
    'PROACTIVE — this is the whole point. Speak up UNPROMPTED only when something genuinely matters: you will run low on fuel before the destination (name the SPECIFIC gas stop already added to the route and how far it is), a speed camera or hazard is coming up, the route changed or traffic is bad, you are arriving soon, or there is a maintenance/known-issue alert for their car. When nothing matters, STAY SILENT. Never chatter, never fill dead air, never re-state what you already said.',
    'STYLE: usually ONE sentence. Calm, confident, specific. No lists, no markdown, no preamble like "sure" or "okay". Numbers rounded and human ("about 12 miles", "in a quarter mile").',
    'FUEL: if the fuel range is less than the distance remaining, proactively tell them they won\'t make it and name the exact gas station already planned on the route and its distance. Do not wait to be asked.',
    'COACHING (gentle, occasional, safety-first): if the context shows they are losing speed on an uphill grade, a single brief cue is fine ("slight grade — ease into the throttle to hold your speed"). Never nag; at most once in a while, and never about something they can\'t safely act on.',
    'TRANSLATION: you are fully multilingual. If the user reads a foreign road sign aloud or asks what something means, translate it plainly. If they are driving in a country whose language differs from theirs, help them read signs and speak to locals.',
    language ? `The user's language is ${language} — speak ${language} by default, and switch if they switch.` : 'Speak the user\'s language; match whatever they speak to you.',
    'TOOLS — you can DO things, not just talk. Use lookup_place when the driver asks about a place, its reviews, rating, hours, price, or "is it any good" (e.g. "what\'s the Thai place ahead like?"). Use open_vision when they want to SHOW you something on the car — a warning light, a noise, a leak, or to identify a part. After a tool returns, say ONE short spoken line with the key facts (e.g. "Four-point-five stars, open till 10, a bit pricey — want me to route there?").',
    'MUTE: to save power and avoid road noise, your mic may be muted between exchanges. You will STILL receive drive context while muted and you can and should speak up for the important triggers above. When the user taps to talk, listen and answer, then it\'s fine to go quiet again.',
    'GREETING: when the session opens, say ONE short line only — something like "I\'m with you — I\'ll pipe up if anything comes up." Then go quiet and wait.',
  ].filter(Boolean).join(' ');
}

function buildInstructions(vehicle: VehicleCtx | null): string {
  const v = vehicle && vehicle.make ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model || ''}${vehicle.trim ? ' ' + vehicle.trim : ''}`.trim() : null;
  return [
    'You are Au7o, a friendly, sharp automotive mechanic talking to a car owner over a live voice call while they point their phone camera at their vehicle.',
    v ? `Their vehicle: ${v}.` : 'You may not know their exact vehicle yet — ask if it matters.',
    'You periodically receive a CAMERA FRAME image showing what they are pointing at. Use the MOST RECENT image to ground your answer.',
    'GREETING: the moment the session starts, speak FIRST — open with exactly: "Let\'s get started — show me what your issue is and I can help." Then stop and listen.',
    'STYLE: spoken conversation — keep answers SHORT (1-3 sentences), natural, and concrete. No markdown, no lists read aloud. Ask one quick clarifying question if you genuinely need it.',
    'DIAGNOSTIC HONESTY: be CONFIDENT and specific about a problem you can clearly see — a shredded belt, a coolant puddle, a nail in the tread, a cracked hose, heavy corrosion — name it plainly and do NOT hedge on the obvious. The camera shows appearance, not measurements, so the only thing to avoid is stating a measured value (tread depth, pad thickness) or inventing a defect that is not clearly visible. If the angle genuinely won\'t let you tell, say so and suggest the quick check — "I can\'t tell from here" is a fine answer when it\'s true, but don\'t default to it.',
    'TIRES: don\'t guess "bald" or a depth from the look. If the tread is worn flush with the wear bars or cord is showing, call it. Otherwise route them to the penny test — "drop a penny in the groove upside down; if you can see all of Lincoln\'s head, it\'s time to replace." For any other measurement, have them lay a coin or card in frame for scale.',
    'SAFETY: never confidently tell someone a safety item (tires, brakes, steering) is "fine" when you cannot actually see that it is — but never invent a problem "to be safe" either. A false "you\'re good" and a false "stop driving" are both harmful; go on what is visibly there.',
    'When you do see an issue, name the part, what looks wrong, how urgent it is (safe / fix soon / stop driving), and the likely fix. Mention a real part or what to search for when helpful.',
    'TOOL — surface_parts: you can put the parts a fix needs ON THE SCREEN as tappable buy cards, hands-free. Whenever the owner asks what parts they need, what to buy, or how to fix what you\'re both looking at — OR when you\'ve just named a repair and buyable parts would help — CALL surface_parts with a short partQuery describing the part (e.g. "front brake rotors and pads", "serpentine belt", "upper radiator hose"). The screen will identify it against the live camera and show real part numbers with buy buttons. Do this instead of just reading a part name aloud. After you call it, say ONE short line like "Putting the parts on your screen now."',
  ].filter(Boolean).join(' ');
}

export async function POST(request: NextRequest) {
  if (!OPENAI_KEY) {
    return NextResponse.json({ error: 'service_unavailable', message: 'Voice is offline.' }, { status: 503 });
  }

  // Tier resolution (no DB hit — subscriptionStatus rides in the JWT). Active
  // subscribers (Plus + Pro) get FULL voice; everyone else gets a capped DEMO.
  let session;
  try { session = await auth(); } catch { session = null; }
  const userId = session?.user?.id ?? null;
  const isSubscriber = session?.user?.subscriptionStatus === 'active';
  const tier: 'full' | 'demo' = isSubscriber ? 'full' : 'demo';

  // Burst protection (shared minute limiter).
  const ip = getClientIp(request);
  const burst = hubChatMinuteLimiter.check(ip);
  if (!burst.success) return rateLimitResponse(burst.reset);

  // DEMO gating: non-payers get a short live taste, capped. Anon → keyed by IP
  // + signup upsell; signed-in free → keyed by userId + upgrade upsell. We PEEK
  // here (not consume) so a downstream mint failure doesn't burn the credit;
  // the credit is consumed only after a successful mint, below.
  const upsell: Upsell | null = tier === 'demo' ? (userId ? FREE_UPSELL : ANON_UPSELL) : null;
  const demoLimiter = userId ? voiceDemoFreeLimiter : voiceDemoAnonLimiter;
  const demoKey = userId ? `user:${userId}` : `ip:${ip}`;
  // The demo ceiling is what separates the free taste from the paid tier, so it
  // has to be durable. The in-memory limiter above resets on every cold start
  // and isn't shared between instances, so on its own it never actually bound —
  // an anonymous caller could re-mint full-tier sessions indefinitely. Check the
  // DB-backed counter first and fall back to the in-memory one only if the DB is
  // unreachable (a blip must not take the signup hook offline).
  const demoLimit = userId ? DEMO_FREE_LIMIT : DEMO_ANON_LIMIT;
  const quotaKey = voiceDemoKey(demoKey);
  if (tier === 'demo') {
    const durable = await peekVoiceDemo(quotaKey, demoLimit);
    const allowed = durable === null ? demoLimiter.peek(demoKey) : durable;
    if (!allowed) {
      // Demo already used — return the upsell instead of minting a paid session.
      return NextResponse.json({ error: 'demo_used', gated: true, tier: 'demo', ...upsell }, { status: 402 });
    }
  }

  let vehicle: VehicleCtx | null = null;
  let mode: 'mechanic' | 'drive' = 'mechanic';
  let lang: string | undefined;
  try {
    const body = await request.json();
    if (body && typeof body === 'object') {
      if (body.vehicle) vehicle = body.vehicle as VehicleCtx;
      if (body.mode === 'drive') mode = 'drive';
      if (typeof body.lang === 'string') lang = body.lang;
    }
  } catch { /* body optional */ }
  const instructions = mode === 'drive' ? buildDriveInstructions(vehicle, lang) : buildInstructions(vehicle);

  // Drive copilot tools — function-calling so the voice can DO things (look up
  // a place's reviews via Google Places, pull up au7o vision). The client
  // executes each call and returns the result over the data channel.
  const driveTools = mode === 'drive' ? [
    {
      type: 'function',
      name: 'lookup_place',
      description: "Look up a specific place near the driver (restaurant, cafe, gas station, hotel, shop, attraction) to get its star rating, review highlights, whether it is open now, price level, and address. Use whenever the driver asks about a place, its reviews, hours, price, or whether it's any good.",
      parameters: { type: 'object', properties: { query: { type: 'string', description: 'Place name or description, e.g. "Olive Garden", "coffee near me", "that ramen spot on Main".' } }, required: ['query'] },
    },
    {
      type: 'function',
      name: 'open_vision',
      description: 'Pull up au7o vision — the live camera diagnostic — so the driver or passenger can show a car problem (warning light, leak, noise, worn part) or identify a part. Use when they want to SHOW you something on the vehicle.',
      parameters: { type: 'object', properties: { reason: { type: 'string', description: 'Short reason, e.g. "check engine light" or "identify a part".' } } },
    },
  ] : undefined;

  // Mechanic tools — the live-camera voice can surface buyable parts on-screen,
  // hands-free, when the owner asks what they need for the fix. The client
  // freezes the current frame, runs identify, and renders the callout cards.
  const mechanicTools = mode === 'mechanic' ? [
    {
      type: 'function',
      name: 'surface_parts',
      description: "Put the parts needed for a repair on the owner's screen as tappable buy cards (real part numbers + buy buttons), grounded against the live camera frame. Call this whenever the owner asks what parts they need, what to buy, or how to fix the problem you're looking at — or right after you name a repair that needs parts.",
      parameters: { type: 'object', properties: { partQuery: { type: 'string', description: 'Short description of the part(s) to surface, e.g. "front brake rotors and pads", "serpentine belt", "upper radiator hose".' } }, required: ['partQuery'] },
    },
  ] : undefined;
  const tools = driveTools ?? mechanicTools;

  try {
    // Realtime GA endpoint + nested session schema (the beta /sessions endpoint
    // + flat body were removed May 2026). voice → audio.output; turn_detection +
    // transcription → audio.input; modalities → output_modalities.
    const r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: REALTIME_MODEL,
          instructions,
          ...(tools ? { tools, tool_choice: 'auto' } : {}),
          // OpenAI Realtime GA only accepts ['text'] OR ['audio'] — NOT both.
          // ['audio','text'] returns a 400 invalid_value (this was silently
          // killing every voice session at the token-mint step). Audio output
          // still streams the assistant transcript via the transcript events.
          output_modalities: ['audio'],
          // Demo tier only: bound the give-away for a client that ignores the
          // 40s countdown. Subscribers are uncapped.
          ...(tier === 'demo' ? { max_output_tokens: DEMO_MAX_OUTPUT_TOKENS } : {}),
          audio: {
            input: {
              transcription: { model: 'whisper-1' },
              // Server-side VAD: the model auto-responds when the user stops talking.
              turn_detection: { type: 'server_vad', threshold: 0.5, prefix_padding_ms: 300, silence_duration_ms: 600 },
            },
            output: { voice: REALTIME_VOICE },
          },
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      console.error('[realtime] session mint failed', r.status, txt.slice(0, 400));
      return NextResponse.json({ error: 'mint_failed', message: 'Could not start a voice session. Try again.', upstreamStatus: r.status }, { status: 502 });
    }
    const data = await r.json();
    // GA returns the ephemeral token at the ROOT (data.value), not nested under
    // client_secret like the old beta /sessions response did.
    const clientSecret = data?.value;
    if (!clientSecret) {
      return NextResponse.json({ error: 'mint_failed', message: 'Voice session returned no token.' }, { status: 502 });
    }
    // Mint succeeded — NOW consume the demo credit (so a failed mint above never
    // burned it). Subscribers don't touch the demo limiter at all.
    if (tier === 'demo') {
      demoLimiter.check(demoKey);
      await consumeVoiceDemo(quotaKey, demoLimit);
    }
    return NextResponse.json({
      client_secret: clientSecret,
      expires_at: data?.expires_at ?? null,
      model: REALTIME_MODEL,
      tier,
      maxSeconds: tier === 'demo' ? DEMO_SECONDS : null,
      upsell, // shown when the demo auto-ends
    });
  } catch (err) {
    console.error('[realtime] mint error', err);
    return NextResponse.json({ error: 'mint_failed', message: 'Voice session unavailable. Try again in a moment.' }, { status: 502 });
  }
}
