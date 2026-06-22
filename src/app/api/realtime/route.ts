import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hubChatMinuteLimiter, getClientIp, rateLimitResponse, voiceDemoAnonLimiter, voiceDemoFreeLimiter } from '@/lib/rate-limit';

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
const REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime';
const REALTIME_VOICE = process.env.OPENAI_REALTIME_VOICE || 'verse';

// Length of the free live-voice taste for non-payers. Short by design — long
// enough to hear the greeting + one exchange (the "wow"), tight enough that the
// give-away cost stays tiny. The client counts down and auto-ends at this mark.
const DEMO_SECONDS = 40;

type Upsell = { message: string; ctaUrl: string; ctaLabel: string };
const ANON_UPSELL: Upsell = { message: 'Sign up free to keep talking to the mechanic.', ctaUrl: '/auth/signup', ctaLabel: 'Sign up free' };
const FREE_UPSELL: Upsell = { message: 'Upgrade to Plus for unlimited live voice with the mechanic.', ctaUrl: '/subscribe', ctaLabel: 'Upgrade to Plus' };

interface VehicleCtx { year?: number; make?: string; model?: string; trim?: string }

function buildInstructions(vehicle: VehicleCtx | null): string {
  const v = vehicle && vehicle.make ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model || ''}${vehicle.trim ? ' ' + vehicle.trim : ''}`.trim() : null;
  return [
    'You are Au7o, a friendly, sharp automotive mechanic talking to a car owner over a live voice call while they point their phone camera at their vehicle.',
    v ? `Their vehicle: ${v}.` : 'You may not know their exact vehicle yet — ask if it matters.',
    'You periodically receive a CAMERA FRAME image showing what they are pointing at. Use the MOST RECENT image to ground your answer.',
    'GREETING: the moment the session starts, speak FIRST — open with exactly: "Let\'s get started — show me what your issue is and I can help." Then stop and listen.',
    'STYLE: spoken conversation — keep answers SHORT (1-3 sentences), natural, and concrete. No markdown, no lists read aloud. Ask one quick clarifying question if you genuinely need it.',
    'DIAGNOSTIC HONESTY (critical): only call out a problem you can actually SEE in the frame. A photo shows appearance, not measurements — never invent a defect (a bald tire, a leak, a bulge) that is not clearly visible. If you cannot tell, say what you would need to see or suggest a hands-on check. Saying "that looks fine / I can\'t tell from here" is a good answer.',
    'When you do see an issue, name the part, what looks wrong, how urgent it is (safe / fix soon / stop driving), and the likely fix. Mention a real part or what to search for when helpful.',
    'If they ask for a measurement (tread depth, gap), tell them to put a quarter or a credit card in frame for scale.',
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
  if (tier === 'demo' && !demoLimiter.peek(demoKey)) {
    // Demo already used — return the upsell instead of minting a paid session.
    return NextResponse.json({ error: 'demo_used', gated: true, tier: 'demo', ...upsell }, { status: 402 });
  }

  let vehicle: VehicleCtx | null = null;
  try {
    const body = await request.json();
    if (body && typeof body === 'object' && body.vehicle) vehicle = body.vehicle as VehicleCtx;
  } catch { /* body optional */ }

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
          instructions: buildInstructions(vehicle),
          // OpenAI Realtime GA only accepts ['text'] OR ['audio'] — NOT both.
          // ['audio','text'] returns a 400 invalid_value (this was silently
          // killing every voice session at the token-mint step). Audio output
          // still streams the assistant transcript via the transcript events.
          output_modalities: ['audio'],
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
    if (tier === 'demo') demoLimiter.check(demoKey);
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
