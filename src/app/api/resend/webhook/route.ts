import { NextRequest, NextResponse } from 'next/server';
import { verifySvixSignature } from '@/lib/svix-verify';
import { suppressEmail } from '@/lib/email-suppression';

export const runtime = 'nodejs';

/**
 * POST /api/resend/webhook — Resend delivery events.
 *
 * Adds an address to the suppression list when it PERMANENTLY bounces or files
 * a spam complaint, so we never send to it again. Every retry of a dead address
 * is charged against our sending reputation, which costs delivery for every
 * real lead — this is the automatic version of hand-deleting the row, and the
 * only version that scales past a couple hundred leads.
 *
 * Resend signs webhooks with Svix. Verification is implemented here directly
 * rather than pulling in the `svix` package — it is an HMAC-SHA256 over
 * `{id}.{timestamp}.{body}`, and the dependency is not worth it for one route.
 *
 * Setup (both required, or the route 503s and Resend will retry):
 *   1. Resend dashboard → Webhooks → add https://au7o.io/api/resend/webhook,
 *      subscribed to `email.bounced` and `email.complained`.
 *   2. Set RESEND_WEBHOOK_SECRET in Vercel to the `whsec_...` signing secret.
 */

interface ResendEvent {
  type?: string;
  data?: {
    to?: string[] | string;
    bounce?: { type?: string; subType?: string; message?: string };
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    // Fail CLOSED: without the secret we cannot tell a real Resend event from
    // anyone who found the URL, and this endpoint writes a permanent
    // do-not-send record. 503 (not 200) so Resend retries once it is set.
    console.error('[resend-webhook] RESEND_WEBHOOK_SECRET not set; refusing unverified events');
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
  }

  // Must be the RAW body — re-serializing parsed JSON changes the bytes and
  // breaks the HMAC.
  const body = await request.text();

  if (!verifySvixSignature(secret, { id: svixId, timestamp: svixTimestamp, signature: svixSignature }, body)) {
    console.warn('[resend-webhook] signature verification failed');
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const type = event.type || '';
  if (type !== 'email.bounced' && type !== 'email.complained') {
    // Delivered/opened/clicked etc. Ack so Resend stops retrying.
    return NextResponse.json({ ok: true, ignored: type });
  }

  const recipients = Array.isArray(event.data?.to)
    ? event.data.to
    : event.data?.to
      ? [event.data.to]
      : [];
  if (recipients.length === 0) {
    return NextResponse.json({ ok: true, suppressed: 0 });
  }

  let reason: 'hard_bounce' | 'complaint';
  let detail: string | undefined;

  if (type === 'email.complained') {
    // A spam complaint is always final — continuing to send after one is the
    // fastest way to lose the sending domain.
    reason = 'complaint';
    detail = 'spam complaint';
  } else {
    const bounce = event.data?.bounce;
    const bounceType = String(bounce?.type || '').toLowerCase();
    if (bounceType !== 'permanent') {
      // Transient/Undetermined: a full mailbox or a greylisting deferral. NOT
      // suppressed — that would drop a real lead forever over a temporary
      // fault, which is worse than one extra bounce.
      return NextResponse.json({ ok: true, suppressed: 0, bounceType: bounceType || 'unknown' });
    }
    reason = 'hard_bounce';
    detail = [bounce?.subType, bounce?.message].filter(Boolean).join(': ') || 'permanent bounce';
  }

  let suppressed = 0;
  for (const address of recipients) {
    try {
      await suppressEmail(address, reason, detail);
      suppressed++;
      console.warn(`[resend-webhook] suppressed ${address} (${reason})`);
    } catch (err) {
      // Ack the rest regardless; a failed write here should not make Resend
      // replay the whole event and re-suppress the ones that succeeded.
      console.error('[resend-webhook] suppression write failed', err);
    }
  }

  return NextResponse.json({ ok: true, suppressed });
}
