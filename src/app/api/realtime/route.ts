import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hubChatMinuteLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * POST /api/realtime — mint a SHORT-LIVED ephemeral OpenAI Realtime session
 * token so the browser can open a WebRTC voice session directly to OpenAI
 * WITHOUT the real API key ever reaching the client.
 *
 * This powers the "Live AI Mechanic" voice layer (talk to it while pointing the
 * camera). Realtime audio is EXPENSIVE per minute, so this is:
 *   - auth-gated (signed-in only) — no anonymous cost abuse,
 *   - burst rate-limited per IP,
 *   - intended for the premium tier (kept on the noindex /camera-spike for now).
 *
 * Returns { client_secret, model, expires_at }. The client uses client_secret
 * as the Bearer for the WebRTC SDP exchange; it expires in ~60s, which is only
 * the handshake window (the live session continues after connect).
 */
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime';
const REALTIME_VOICE = process.env.OPENAI_REALTIME_VOICE || 'verse';

interface VehicleCtx { year?: number; make?: string; model?: string; trim?: string }

function buildInstructions(vehicle: VehicleCtx | null): string {
  const v = vehicle && vehicle.make ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model || ''}${vehicle.trim ? ' ' + vehicle.trim : ''}`.trim() : null;
  return [
    'You are Au7o, a friendly, sharp automotive mechanic talking to a car owner over a live voice call while they point their phone camera at their vehicle.',
    v ? `Their vehicle: ${v}.` : 'You may not know their exact vehicle yet — ask if it matters.',
    'You periodically receive a CAMERA FRAME image showing what they are pointing at. Use the MOST RECENT image to ground your answer.',
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

  // Auth gate — signed-in only (premium, cost-bearing feature).
  let session;
  try { session = await auth(); } catch { session = null; }
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'login_required', message: 'Sign in to start a voice session.' }, { status: 401 });
  }

  // Burst protection (shared minute limiter).
  const burst = hubChatMinuteLimiter.check(getClientIp(request));
  if (!burst.success) return rateLimitResponse(burst.reset);

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
          output_modalities: ['audio', 'text'],
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
    return NextResponse.json({
      client_secret: clientSecret,
      expires_at: data?.expires_at ?? null,
      model: REALTIME_MODEL,
    });
  } catch (err) {
    console.error('[realtime] mint error', err);
    return NextResponse.json({ error: 'mint_failed', message: 'Voice session unavailable. Try again in a moment.' }, { status: 502 });
  }
}
