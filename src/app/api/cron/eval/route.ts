import { NextResponse } from 'next/server';
import { runPartInvariants } from '@/lib/part-eval-invariants';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Cron: run the part-resolution invariants daily and PING on failure — so a
 * regression (a fabricated PN, a bare-OEM-PN retail URL, an untagged eBay link)
 * gets noticed the next day without anyone remembering to run the eval.
 *
 * Auth FAILS CLOSED like the other crons (CRON_SECRET Bearer). On failure it
 * emails FEEDBACK_NOTIFY_EMAIL (best-effort). Returns the full result either way.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = await runPartInvariants();
  const failures = results.filter((r) => !r.ok);

  if (failures.length) {
    const to = process.env.FEEDBACK_NOTIFY_EMAIL;
    if (to) {
      const lines = failures.map((f) => `• ${f.name}: ${f.detail || 'failed'}`).join('\n');
      try {
        await sendEmail({
          to,
          subject: `⚠ au7o part-resolution eval FAILED (${failures.length})`,
          text: `The daily part-resolution invariants failed — a regression may have landed:\n\n${lines}\n\nRun locally: npx tsx scripts/eval-resolve-parts.ts`,
          html: `<p>The daily part-resolution invariants failed — a regression may have landed:</p><ul>${failures.map((f) => `<li><b>${f.name}</b>: ${f.detail || 'failed'}</li>`).join('')}</ul><p><code>npx tsx scripts/eval-resolve-parts.ts</code></p>`,
        });
      } catch { /* best-effort */ }
    }
    console.error('[cron/eval] FAIL', failures);
    return NextResponse.json({ ok: false, failures, results }, { status: 500 });
  }

  console.log('[cron/eval] PASS', results.length);
  return NextResponse.json({ ok: true, results });
}
