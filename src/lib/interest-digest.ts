import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';
import { sendEmail, appUrl } from '@/lib/email';
import { makeSlug } from '@/lib/known-issues';
import { getRecallsForArticle, type RecallItem } from '@/lib/recalls';

/**
 * Weekly "new findings for your vehicle" digest — the server-side engine behind
 * the Vercel cron (/api/cron/interest-digest). Mirrors scripts/send-interest-
 * digests.js (the local/manual twin) — keep the email template in sync between
 * the two. Sends each active lead the published issues for their vehicle since
 * lastNotifiedAt (first send = catch-up of recent issues), once per finding
 * (watermark → idempotent). Skips unsubscribed. CAN-SPAM: one-click unsubscribe
 * + physical mailing address in the footer; refuses to send without the address.
 */

const MAX_PER_DIGEST = 10;
const esc = (s: unknown) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sevDot = (sev: string) => (sev === 'critical' || sev === 'high' ? '🔴' : sev === 'medium' ? '🟡' : '⚪');

// NHTSA returns ReportReceivedDate as "DD/MM/YYYY" (not ISO), which new Date()
// can't parse — so "new since last digest" comparisons would silently fail.
function parseRecallDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const dm = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s).trim());
  const d = dm ? new Date(`${dm[3]}-${dm[2]}-${dm[1]}`) : new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// Weekly cohort cutoff: only email leads who signed up BEFORE this week's Monday
// (00:00 UTC). Signups during the week auto-queue for next Monday (deepened by
// then). Clean weekly cohort, no manual management.
function mondayUTC(now = new Date()): Date {
  const x = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = x.getUTCDay(); // 0 Sun .. 6 Sat
  x.setUTCDate(x.getUTCDate() - (day === 0 ? 6 : day - 1));
  return x;
}

function buildDigestHtml(opts: {
  vehicle: string;
  issues: { id: string; title: string; severity: string }[];
  recalls: RecallItem[];
  slug: string;
  unsubToken: string;
  isCatchUp: boolean;
}): string {
  const { vehicle, issues, recalls, slug, unsubToken, isCatchUp } = opts;
  const base = appUrl();
  const mailing = process.env.AU7O_MAILING_ADDRESS || '';
  const url = `${base}/known-issues/${slug}`;
  const unsub = `${base}/api/interest/unsubscribe?token=${encodeURIComponent(unsubToken)}`;
  const heading = isCatchUp ? `Known issues for your ${esc(vehicle)}` : `New findings for your ${esc(vehicle)}`;
  const intro = isCatchUp
    ? `You asked us to keep you posted on your ${esc(vehicle)}. Here's what we've documented so far — worth a look:`
    : `Here's what's new for your ${esc(vehicle)} since we last checked in:`;
  const rows = issues
    .map(
      (i) => `
    <tr><td style="padding:10px 0;border-bottom:1px solid #EEE;font-size:14px;line-height:1.4;color:#0B1220">
      <span style="margin-right:6px">${sevDot(i.severity)}</span>
      <a href="${url}#${i.id}" style="color:#0B1220;text-decoration:none;font-weight:600">${esc(i.title)}</a>
    </td></tr>`,
    )
    .join('');
  // Safety recalls block — highest priority, free dealer fix. Only rendered
  // when there are recalls genuinely new since the last digest.
  const recallBlock = recalls.length === 0 ? '' : `
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:14px 16px;margin:0 0 16px">
        <div style="font-size:13px;font-weight:800;color:#B91C1C;margin-bottom:8px">🛡️ ${recalls.length} new safety recall${recalls.length > 1 ? 's' : ''} — free fix at the dealer</div>
        ${recalls.map((r) => `<div style="font-size:13px;color:#0B1220;margin:6px 0;line-height:1.4"><strong>${esc(r.component || 'Recall')}</strong> — ${esc((r.summary || '').slice(0, 140))}${(r.summary || '').length > 140 ? '…' : ''}</div>`).join('')}
        <a href="https://www.nhtsa.gov/recalls" style="display:inline-block;margin-top:8px;font-size:12.5px;font-weight:700;color:#B91C1C">Check your VIN + book the free repair →</a>
      </div>`;
  return `<!doctype html><html><body style="margin:0;background:#F7F6F2;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px">
    <div style="margin-bottom:8px">
      <img src="${base}/icons/icon-192.png" alt="au7o" width="30" height="30" style="vertical-align:middle;border-radius:7px;display:inline-block">
      <span style="font-size:16px;font-weight:800;color:#0B1220;vertical-align:middle;margin-left:8px">au7o</span>
    </div>
    <div style="background:#fff;border:1px solid #E3DFD4;border-radius:16px;padding:22px">
      <h1 style="font-size:18px;margin:0 0 4px;color:#0B1220">${heading}</h1>
      <p style="font-size:14px;color:#475569;margin:0 0 14px;line-height:1.5">${intro}</p>
      ${recallBlock}
      <table style="width:100%;border-collapse:collapse">${rows}</table>
      <a href="${url}" style="display:inline-block;margin-top:18px;background:#0B1220;color:#fff;text-decoration:none;padding:11px 18px;border-radius:10px;font-size:14px;font-weight:700">See all known issues for your ${esc(vehicle)} →</a>
      <p style="font-size:13px;color:#64748B;margin:16px 0 0;line-height:1.5">Got a noise, leak, or warning light? Point your phone at it and the au7o mechanic will tell you what it is — <a href="${base}/diagnose" style="color:#2563EB">try a free diagnosis</a>.</p>
    </div>
    <p style="font-size:11px;color:#94A3B8;text-align:center;margin:16px 0 0;line-height:1.5">
      You're getting this because you asked au7o to alert you about new findings for your ${esc(vehicle)}. We only email when there's something new — usually no more than once a week (Mondays).<br>
      <a href="${unsub}" style="color:#94A3B8">Unsubscribe</a>${mailing ? ` &nbsp;·&nbsp; ${esc(mailing)}` : ''}
    </p>
  </div></body></html>`;
}

export interface DigestResult {
  sent: number;
  failed: number;
  skippedNoMatch: number;
  skippedNoNew: number;
  reason?: string;
}

export async function runInterestDigest(): Promise<DigestResult> {
  const result: DigestResult = { sent: 0, failed: 0, skippedNoMatch: 0, skippedNoNew: 0 };
  // CAN-SPAM: never send without a physical address in the footer.
  if (!process.env.AU7O_MAILING_ADDRESS) { result.reason = 'AU7O_MAILING_ADDRESS not set — refusing to send.'; return result; }
  if (!process.env.RESEND_API_KEY) { result.reason = 'RESEND_API_KEY not set — nothing sent.'; return result; }

  const leads = await prisma.interestEmail.findMany({
    where: { unsubscribedAt: null, context: { startsWith: 'known-issues:' } },
    select: { id: true, email: true, context: true, createdAt: true, lastNotifiedAt: true, unsubscribeToken: true },
  });
  // Weekly cohort: only leads who signed up before this Monday; the rest queue.
  const weekStart = mondayUTC();
  const eligible = leads.filter((l) => new Date(l.createdAt) < weekStart);
  const pairs = await prisma.knownIssue.findMany({ where: { status: 'published' }, distinct: ['make', 'model'], select: { make: true, model: true } });
  const pairBySubject = new Map<string, { make: string; model: string }>();
  for (const p of pairs) pairBySubject.set(`${p.make} ${p.model}`.toLowerCase().trim(), p);

  for (const lead of eligible) {
    const subject = String(lead.context || '').slice('known-issues:'.length).trim();
    const pair = pairBySubject.get(subject.toLowerCase());
    if (!pair) { result.skippedNoMatch++; continue; }

    const since = lead.lastNotifiedAt;
    const isCatchUp = !since;
    const where: Record<string, unknown> = { status: 'published', make: pair.make, model: pair.model };
    if (since) where.createdAt = { gt: since };
    const issues = await prisma.knownIssue.findMany({ where, orderBy: { createdAt: 'desc' }, take: MAX_PER_DIGEST, select: { id: true, title: true, severity: true } });

    // NHTSA recalls genuinely new since the last digest. Leads carry no model
    // year, so derive the year span from our published coverage for this
    // (make, model) and only keep recalls whose NHTSA report date is newer
    // than lastNotifiedAt (first send = last 90 days, to avoid a decade dump).
    let recalls: RecallItem[] = [];
    try {
      const yearRows = await prisma.knownIssue.findMany({ where: { status: 'published', make: pair.make, model: pair.model }, select: { years: true } });
      const years = [...new Set(yearRows.flatMap((r) => r.years || []))].sort((a, b) => b - a).slice(0, 8);
      if (years.length > 0) {
        const all = await getRecallsForArticle(pair.make, pair.model, years);
        const cutoff = since ? new Date(since) : new Date(Date.now() - 90 * 86400000);
        recalls = all.filter((r) => { const d = parseRecallDate(r.reportDate); return !!d && d > cutoff; }).slice(0, 5);
      }
    } catch { /* recalls are additive — never block the issue digest */ }

    if (issues.length === 0 && recalls.length === 0) { result.skippedNoNew++; continue; }

    let token = lead.unsubscribeToken;
    if (!token) { token = randomBytes(24).toString('base64url'); await prisma.interestEmail.update({ where: { id: lead.id }, data: { unsubscribeToken: token } }); }

    const vehicle = `${pair.make} ${pair.model}`;
    const html = buildDigestHtml({ vehicle, issues, recalls, slug: makeSlug(pair.make, pair.model), unsubToken: token, isCatchUp });
    const subjectLine = recalls.length > 0
      ? `Safety recall for your ${vehicle} — au7o`
      : isCatchUp ? `Known issues for your ${vehicle} — au7o` : `New findings for your ${vehicle} — au7o`;
    const ok = await sendEmail({ to: lead.email, subject: subjectLine, html });
    if (ok) { await prisma.interestEmail.update({ where: { id: lead.id }, data: { lastNotifiedAt: new Date() } }); result.sent++; }
    else { result.failed++; }
  }
  return result;
}
