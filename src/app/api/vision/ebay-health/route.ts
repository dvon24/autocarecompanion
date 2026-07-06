import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';
import { ebayHealthProbe } from '@/lib/ebay-resolver';

export const runtime = 'nodejs';

/**
 * GET /api/vision/ebay-health — founder-only. Mints a real eBay OAuth token and
 * runs a Browse search so we can confirm the production creds work (and that
 * Buy API access is granted) without exposing the secret. Returns 404 to anyone
 * who isn't the founder so it doesn't advertise itself.
 */
export async function GET(request: Request) {
  let session;
  try { session = await auth(); } catch { session = null; }
  if (!session?.user?.email || !isFounderEmail(session.user.email)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const q = new URL(request.url).searchParams.get('q') || undefined;
  const health = await ebayHealthProbe(q);
  return NextResponse.json(health);
}
