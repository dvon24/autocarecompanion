import { NextResponse } from 'next/server';
import { runPartInvariants } from '@/lib/part-eval-invariants';
import { sendEmail } from '@/lib/email';
import prisma from '@/lib/db';

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

  // Zero-capture watchdog: the email-lead regression was caught only because
  // Devon watches the admin screen — give it the same eval treatment. But at a
  // 1-3/day baseline a single zero-day is statistically routine (a quiet Sunday),
  // so only ALARM on a 48h drought; a single zero-day is just a ⚠ note in the line.
  let captures24h = -1, captures48h = -1;
  try {
    captures24h = await prisma.interestEmail.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
    captures48h = await prisma.interestEmail.count({ where: { createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) } } });
  } catch { /* best-effort */ }

  // ALWAYS send a one-line daily status so silence is never ambiguous (Fable):
  // green ✓ when everything's healthy, ✗/⚠ when a check trips.
  const captureAlarm = captures48h === 0; // 48h drought = real; single zero-day = routine
  const ok = failures.length === 0 && !captureAlarm;
  const to = process.env.FEEDBACK_NOTIFY_EMAIL;
  if (to) {
    const capLine = captures24h < 0 ? 'captures: (count unavailable)' : `${captures24h} email capture${captures24h === 1 ? '' : 's'}/24h`;
    const subject = ok
      ? `✅ au7o daily: evals pass · ${capLine}`
      : `⚠ au7o daily: ${failures.length ? `eval FAILED (${failures.length})` : ''}${failures.length && captureAlarm ? ' · ' : ''}${captureAlarm ? 'ZERO email captures/24h' : ''}`;
    const body = [
      failures.length ? `Eval FAILURES (a part-resolution regression may have landed):\n${failures.map((f) => `• ${f.name}: ${f.detail || 'failed'}`).join('\n')}` : `Evals: all ${results.length} invariants pass ✓`,
      captureAlarm
        ? `\n⚠ ZERO known-issues email captures in the last 48h — the lead form is likely broken or buried.`
        : `\nLeads: ${capLine}.${captures24h === 0 ? ' ⚠ (0 today — routine on a quiet day, watch tomorrow)' : ''}`,
    ].join('\n');
    try {
      await sendEmail({ to, subject, text: body, html: `<pre style="font-family:system-ui">${body}</pre>` });
    } catch { /* best-effort */ }
  }

  if (!ok) {
    console.error('[cron/eval]', { failures: failures.length, captures24h });
    return NextResponse.json({ ok: false, failures, captures24h, results }, { status: failures.length ? 500 : 200 });
  }
  console.log('[cron/eval] PASS', results.length, 'captures24h', captures24h);
  return NextResponse.json({ ok: true, captures24h, results });
}
