import { NextResponse } from 'next/server';
import { runInterestDigest } from '@/lib/interest-digest';

export const runtime = 'nodejs';
// Was 60. The 2026-08-17 run was killed at 57.7s having emailed 92 of 155
// eligible recipients, and because the loop was unordered it chopped the same
// tail every week — 63 leads had never received anything. runInterestDigest now
// stops itself at SEND_BUDGET_MS (240s); this is the outer wall behind it.
export const maxDuration = 300;

/**
 * Cron: weekly "new findings for your vehicle" digest to interest-email leads.
 *
 * Auth FAILS CLOSED: refuses to run unless CRON_SECRET is set and matches the
 * Bearer token Vercel Cron sends — an unauthenticated hit would re-blast the
 * whole list. (Same pattern as /api/cron/maintenance-check.)
 *
 * The send itself is idempotent (lastNotifiedAt watermark), so even a double
 * trigger only emails vehicles with genuinely new findings.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[cron/interest-digest] CRON_SECRET not set — refusing to run (fail closed).');
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runInterestDigest();
    console.log('[cron/interest-digest]', result);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error('[cron/interest-digest] failed:', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
