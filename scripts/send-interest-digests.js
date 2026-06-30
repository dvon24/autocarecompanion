// Weekly "new findings for your vehicle" digest for interest-email leads.
//
// For each ACTIVE lead (not unsubscribed) whose context names a vehicle, find
// the published known-issues for that exact make+model published since we last
// emailed them, and send a short digest that pulls them back to the site (where
// the diagnose/voice wow + the paywall live). Each finding is emailed once
// (lastNotifiedAt watermark). CAN-SPAM: every email has a one-click unsubscribe
// + sender identity + physical mailing address.
//
//   node scripts/send-interest-digests.js            # DRY RUN (preview, no send)
//   node scripts/send-interest-digests.js --send     # actually send via Resend
//
// Env (.env.local): RESEND_API_KEY, FROM_EMAIL (verified au7o.io sender),
//   APP_URL (https://au7o.io), AU7O_MAILING_ADDRESS (required for a real send).
require('dotenv').config({ path: '.env.local' });
const { randomBytes } = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const SEND = process.argv.includes('--send');
// --test=you@email.com → send ONE sample digest to that address (validates the
// Resend key + domain + how it looks in a real inbox) WITHOUT emailing any real
// lead or touching any watermark.
const TEST_TO = (process.argv.find((a) => a.startsWith('--test=')) || '').split('=')[1] || null;
const MAX_PER_DIGEST = 10; // newest N findings per email; "+more on the site"
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://au7o.io';
const FROM = process.env.FROM_EMAIL || 'Au7o <onboarding@resend.dev>';
const MAILING_ADDRESS = process.env.AU7O_MAILING_ADDRESS || '';

// Weekly cohort cutoff: a lead is eligible for this Monday's digest only if they
// signed up BEFORE this week's Monday (00:00 UTC). Signups during the week
// auto-queue for next Monday — by which point the auto-deepen loop has deepened
// their vehicle. Keeps a clean weekly cohort with no manual management.
function mondayUTC(now = new Date()) {
  const x = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = x.getUTCDay(); // 0 Sun .. 6 Sat
  x.setUTCDate(x.getUTCDate() - (day === 0 ? 6 : day - 1));
  return x;
}

// Canonical /known-issues/{slug} builder — MUST match makeSlug() in
// src/lib/known-issues.ts (NFD-normalize + diacritic-strip) so links never 404.
function makeSlug(make, model) {
  return `${make} ${model}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sevDot = (sev) => sev === 'critical' || sev === 'high' ? '🔴' : sev === 'medium' ? '🟡' : '⚪';

// NHTSA recalls (mirrors src/lib/recalls.ts + interest-digest.ts). ReportReceivedDate
// is "DD/MM/YYYY", which new Date() can't parse — so normalize it.
const NHTSA_RECALLS = 'https://api.nhtsa.gov/recalls/recallsByVehicle';
function parseRecallDate(s) {
  if (!s) return null;
  const dm = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s).trim());
  const d = dm ? new Date(`${dm[3]}-${dm[2]}-${dm[1]}`) : new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
// Fetch recalls for a (make, model) across recent years, keep those genuinely
// NEW since `since` (first send = last 90 days). Fail-soft → [].
async function newRecallsFor(make, model, years, since) {
  const recent = [...years].sort((a, b) => b - a).slice(0, 5);
  const seen = new Map();
  for (const y of recent) {
    try {
      const res = await fetch(`${NHTSA_RECALLS}?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${y}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      for (const r of data.results || []) {
        if (r.NHTSACampaignNumber && !seen.has(r.NHTSACampaignNumber)) seen.set(r.NHTSACampaignNumber, { component: r.Component, summary: r.Summary, reportDate: r.ReportReceivedDate });
      }
    } catch { /* skip this year */ }
  }
  const cutoff = since ? new Date(since) : new Date(Date.now() - 90 * 86400000);
  return [...seen.values()].filter((r) => { const d = parseRecallDate(r.reportDate); return !!d && d > cutoff; }).slice(0, 5);
}

function digestHtml({ vehicle, issues, recalls = [], slug, unsubToken, isCatchUp }) {
  const url = `${APP_URL}/known-issues/${slug}`;
  const unsub = `${APP_URL}/api/interest/unsubscribe?token=${encodeURIComponent(unsubToken)}`;
  const heading = isCatchUp ? `Known issues for your ${esc(vehicle)}` : `New findings for your ${esc(vehicle)}`;
  const intro = isCatchUp
    ? `You asked us to keep you posted on your ${esc(vehicle)}. Here's what we've documented so far — worth a look:`
    : `Here's what's new for your ${esc(vehicle)} since we last checked in:`;
  const rows = issues.map((i) => `
    <tr><td style="padding:10px 0;border-bottom:1px solid #EEE;font-size:14px;line-height:1.4;color:#0B1220">
      <span style="margin-right:6px">${sevDot(i.severity)}</span>
      <a href="${url}#${i.id}" style="color:#0B1220;text-decoration:none;font-weight:600">${esc(i.title)}</a>
    </td></tr>`).join('');
  return `<!doctype html><html><body style="margin:0;background:#F7F6F2;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px">
    <div style="margin-bottom:8px">
      <img src="${APP_URL}/icons/icon-192.png" alt="au7o" width="30" height="30" style="vertical-align:middle;border-radius:7px;display:inline-block">
      <span style="font-size:16px;font-weight:800;color:#0B1220;vertical-align:middle;margin-left:8px">au7o</span>
    </div>
    <div style="background:#fff;border:1px solid #E3DFD4;border-radius:16px;padding:22px">
      <h1 style="font-size:18px;margin:0 0 4px;color:#0B1220">${heading}</h1>
      <p style="font-size:14px;color:#475569;margin:0 0 14px;line-height:1.5">${intro}</p>
      ${recalls.length === 0 ? '' : `
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:14px 16px;margin:0 0 16px">
        <div style="font-size:13px;font-weight:800;color:#B91C1C;margin-bottom:8px">🛡️ ${recalls.length} new safety recall${recalls.length > 1 ? 's' : ''} — free fix at the dealer</div>
        ${recalls.map((r) => `<div style="font-size:13px;color:#0B1220;margin:6px 0;line-height:1.4"><strong>${esc(r.component || 'Recall')}</strong> — ${esc((r.summary || '').slice(0, 140))}${(r.summary || '').length > 140 ? '…' : ''}</div>`).join('')}
        <a href="https://www.nhtsa.gov/recalls" style="display:inline-block;margin-top:8px;font-size:12.5px;font-weight:700;color:#B91C1C">Check your VIN + book the free repair →</a>
      </div>`}
      <table style="width:100%;border-collapse:collapse">${rows}</table>
      <a href="${url}" style="display:inline-block;margin-top:18px;background:#0B1220;color:#fff;text-decoration:none;padding:11px 18px;border-radius:10px;font-size:14px;font-weight:700">See all known issues for your ${esc(vehicle)} →</a>
      <p style="font-size:13px;color:#64748B;margin:16px 0 0;line-height:1.5">Got a noise, leak, or warning light? Point your phone at it and the au7o mechanic will tell you what it is — <a href="${APP_URL}/diagnose" style="color:#2563EB">try a free diagnosis</a>.</p>
    </div>
    <p style="font-size:11px;color:#94A3B8;text-align:center;margin:16px 0 0;line-height:1.5">
      You're getting this because you asked au7o to alert you about new findings for your ${esc(vehicle)}. We only email when there's something new — usually no more than once a week (Mondays).<br>
      <a href="${unsub}" style="color:#94A3B8">Unsubscribe</a>${MAILING_ADDRESS ? ` &nbsp;·&nbsp; ${esc(MAILING_ADDRESS)}` : ''}
    </p>
  </div></body></html>`;
}

(async () => {
  if ((SEND || TEST_TO) && !process.env.RESEND_API_KEY) { console.error('FAIL: RESEND_API_KEY is not set. Aborting (no emails sent).'); process.exit(1); }
  if ((SEND || TEST_TO) && !MAILING_ADDRESS) { console.error('FAIL: AU7O_MAILING_ADDRESS is required (CAN-SPAM needs a physical address in the footer). Set it in .env.local. Aborting.'); process.exit(1); }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // Active leads with a vehicle context.
  const leads = await prisma.interestEmail.findMany({
    where: { unsubscribedAt: null, context: { startsWith: 'known-issues:' } },
    select: { id: true, email: true, context: true, createdAt: true, lastNotifiedAt: true, unsubscribeToken: true },
  });
  console.log('Active vehicle-context leads: ' + leads.length + (TEST_TO ? '  [TEST MODE → ' + TEST_TO + ', no leads emailed]' : SEND ? '  [SEND MODE]' : '  [DRY RUN — no emails sent]'));

  // Weekly cohort: only leads who signed up before this Monday. (TEST mode keeps
  // all so a sample can always be produced.)
  const weekStart = mondayUTC();
  const eligible = TEST_TO ? leads : leads.filter((l) => new Date(l.createdAt) < weekStart);
  console.log('Eligible (signed up before ' + weekStart.toISOString().slice(0, 10) + '): ' + eligible.length + '  |  queued for next Monday: ' + (leads.length - eligible.length));

  // Canonical (make,model) pairs from published issues → match a lead's subject
  // robustly (handles multi-word makes/models, e.g. "Land Rover Range Rover").
  const pairs = await prisma.knownIssue.findMany({ where: { status: 'published' }, distinct: ['make', 'model'], select: { make: true, model: true } });
  const pairBySubject = new Map();
  for (const p of pairs) pairBySubject.set(`${p.make} ${p.model}`.toLowerCase().trim(), p);

  let resend = null;
  if (SEND || TEST_TO) { const { Resend } = require('resend'); resend = new Resend(process.env.RESEND_API_KEY); }

  let sent = 0, skippedNoMatch = 0, skippedNoNew = 0, failed = 0;
  for (const lead of eligible) {
    const subject = String(lead.context || '').slice('known-issues:'.length).trim();
    const pair = pairBySubject.get(subject.toLowerCase());
    if (!pair) { skippedNoMatch++; console.log('  · skip (no vehicle match): ' + lead.email + ' — "' + subject + '"'); continue; }

    // Never emailed (lastNotifiedAt null) → send a CATCH-UP of the most recent
    // issues for their vehicle (what they signed up to see). After that first
    // send sets the watermark, future runs only include genuinely NEW issues.
    const since = lead.lastNotifiedAt;
    const isCatchUp = !since;
    const where = { status: 'published', make: pair.make, model: pair.model };
    if (since) where.createdAt = { gt: since };
    const issues = await prisma.knownIssue.findMany({
      where, orderBy: { createdAt: 'desc' }, take: MAX_PER_DIGEST,
      select: { id: true, title: true, severity: true },
    });

    // NHTSA recalls new since last digest. Leads carry no model year → derive the
    // year span from our published coverage for this (make, model).
    let recalls = [];
    try {
      const yearRows = await prisma.knownIssue.findMany({ where: { status: 'published', make: pair.make, model: pair.model }, select: { years: true } });
      const years = [...new Set(yearRows.flatMap((r) => r.years || []))];
      if (years.length > 0) recalls = await newRecallsFor(pair.make, pair.model, years, since);
    } catch { /* recalls are additive — never block the digest */ }

    if (issues.length === 0 && recalls.length === 0) { skippedNoNew++; console.log('  · skip (nothing new): ' + lead.email + ' — ' + pair.make + ' ' + pair.model); continue; }

    // Ensure an unsubscribe token (backfill legacy rows captured before tokens).
    let token = lead.unsubscribeToken;
    if (!token) { token = randomBytes(24).toString('base64url'); await prisma.interestEmail.update({ where: { id: lead.id }, data: { unsubscribeToken: token } }); }

    const vehicle = `${pair.make} ${pair.model}`;
    const html = digestHtml({ vehicle, issues, recalls, slug: makeSlug(pair.make, pair.model), unsubToken: token, isCatchUp });
    const subjectLine = recalls.length > 0
      ? `Safety recall for your ${vehicle} — au7o`
      : isCatchUp ? `Known issues for your ${vehicle} — au7o` : `New findings for your ${vehicle} — au7o`;

    if (TEST_TO) {
      // Send ONE realistic sample to the tester, then stop. No lead emailed, no
      // watermark touched.
      try {
        const r = await resend.emails.send({ from: FROM, to: TEST_TO, subject: '[TEST] ' + subjectLine, html });
        if (r && r.error) { console.error('  ! TEST send REJECTED by Resend → ' + TEST_TO + ': ' + JSON.stringify(r.error)); }
        else console.log('  ✓ TEST sent → ' + TEST_TO + '  (sample: ' + vehicle + ', ' + issues.length + ' issues, id=' + (r.data && r.data.id) + '). No real leads emailed, no watermark changed.');
      } catch (e) { console.error('  ! TEST send threw → ' + TEST_TO + ': ' + (e instanceof Error ? e.message : e)); }
      break;
    }
    if (!SEND) {
      console.log('  ✉  WOULD SEND → ' + lead.email + '  [' + vehicle + ', ' + issues.length + ' issue' + (issues.length === 1 ? '' : 's') + (recalls.length ? ', ' + recalls.length + ' RECALL' + (recalls.length === 1 ? '' : 'S') : '') + ']');
      for (const r of recalls) console.log('       🛡️ RECALL: ' + (r.component || 'Recall'));
      for (const i of issues) console.log('       ' + sevDot(i.severity) + ' ' + i.title);
      continue;
    }
    try {
      const r = await resend.emails.send({ from: FROM, to: lead.email, subject: subjectLine, html });
      if (r && r.error) { failed++; console.error('  ! send REJECTED by Resend → ' + lead.email + ': ' + JSON.stringify(r.error) + '  (watermark NOT set)'); continue; }
      await prisma.interestEmail.update({ where: { id: lead.id }, data: { lastNotifiedAt: new Date() } });
      sent++; console.log('  ✓ sent → ' + lead.email + ' (' + vehicle + ', ' + issues.length + ')');
    } catch (e) { failed++; console.error('  ! send threw → ' + lead.email + ': ' + (e instanceof Error ? e.message : e)); }
  }

  console.log('\n' + (SEND ? 'Sent ' + sent + ', ' : 'Dry run — ') + 'failed ' + failed + ', skipped ' + skippedNoMatch + ' (no vehicle match) + ' + skippedNoNew + ' (nothing new).');
  if (!SEND) console.log('Re-run with --send to actually email (requires RESEND_API_KEY + AU7O_MAILING_ADDRESS).');
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
