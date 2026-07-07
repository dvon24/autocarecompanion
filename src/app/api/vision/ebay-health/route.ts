import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';
import { ebayHealthProbe } from '@/lib/ebay-resolver';

export const runtime = 'nodejs';

/**
 * GET /api/vision/ebay-health — founder-only (session) OR eval-runner (an
 * `x-eval-token` header / `?token=` matching EVAL_TOKEN, so a headless cron can
 * run the Path-B eval suite without a browser session). Mints a real eBay OAuth
 * token and runs a Browse search to confirm creds + surface the seller-distinct
 * tier breakdown. Returns 404 to anyone else so it doesn't advertise itself.
 *
 * Optional structured params exercise the trim-aware fitment filter:
 *   ?q=...&category=rotor&trim=SRT%20392&model=Challenger&make=Dodge
 */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const evalToken = process.env.EVAL_TOKEN;
  const provided = request.headers.get('x-eval-token') || sp.get('token') || '';
  const tokenOk = !!evalToken && provided === evalToken;

  if (!tokenOk) {
    let session;
    try { session = await auth(); } catch { session = null; }
    if (!session?.user?.email || !isFounderEmail(session.user.email)) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
  }

  const q = sp.get('q') || undefined;
  const opts = (sp.get('category') || sp.get('trim') || sp.get('model'))
    ? { category: sp.get('category') || undefined, make: sp.get('make') || undefined, model: sp.get('model') || undefined, trim: sp.get('trim') || undefined }
    : undefined;
  const health = await ebayHealthProbe(q, opts);
  return NextResponse.json(health);
}
