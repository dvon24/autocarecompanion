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
const MAX_PER_DIGEST = 10; // newest N findings per email; "+more on the site"
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://au7o.io';
const FROM = process.env.FROM_EMAIL || 'Au7o <onboarding@resend.dev>';
const MAILING_ADDRESS = process.env.AU7O_MAILING_ADDRESS || '';

// Canonical /known-issues/{slug} builder — MUST match makeSlug() in
// src/lib/known-issues.ts (NFD-normalize + diacritic-strip) so links never 404.
function makeSlug(make, model) {
  return `${make} ${model}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sevDot = (sev) => sev === 'critical' || sev === 'high' ? '🔴' : sev === 'medium' ? '🟡' : '⚪';

function digestHtml({ vehicle, issues, slug, unsubToken, isCatchUp }) {
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
    <div style="font-size:15px;font-weight:800;color:#0B1220;margin-bottom:4px">au7o</div>
    <div style="background:#fff;border:1px solid #E3DFD4;border-radius:16px;padding:22px">
      <h1 style="font-size:18px;margin:0 0 4px;color:#0B1220">${heading}</h1>
      <p style="font-size:14px;color:#475569;margin:0 0 14px;line-height:1.5">${intro}</p>
      <table style="width:100%;border-collapse:collapse">${rows}</table>
      <a href="${url}" style="display:inline-block;margin-top:18px;background:#0B1220;color:#fff;text-decoration:none;padding:11px 18px;border-radius:10px;font-size:14px;font-weight:700">See all known issues for your ${esc(vehicle)} →</a>
      <p style="font-size:13px;color:#64748B;margin:16px 0 0;line-height:1.5">Got a noise, leak, or warning light? Point your phone at it and the au7o mechanic will tell you what it is — <a href="${APP_URL}/diagnose" style="color:#2563EB">try a free diagnosis</a>.</p>
    </div>
    <p style="font-size:11px;color:#94A3B8;text-align:center;margin:16px 0 0;line-height:1.5">
      You're getting this because you asked au7o to alert you about new findings for your ${esc(vehicle)}.<br>
      <a href="${unsub}" style="color:#94A3B8">Unsubscribe</a>${MAILING_ADDRESS ? ` &nbsp;·&nbsp; ${esc(MAILING_ADDRESS)}` : ''}
    </p>
  </div></body></html>`;
}

(async () => {
  if (SEND && !process.env.RESEND_API_KEY) { console.error('FAIL: --send but RESEND_API_KEY is not set. Aborting (no emails sent).'); process.exit(1); }
  if (SEND && !MAILING_ADDRESS) { console.error('FAIL: --send requires AU7O_MAILING_ADDRESS (CAN-SPAM needs a physical address in the footer). Set it in .env.local. Aborting.'); process.exit(1); }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // Active leads with a vehicle context.
  const leads = await prisma.interestEmail.findMany({
    where: { unsubscribedAt: null, context: { startsWith: 'known-issues:' } },
    select: { id: true, email: true, context: true, createdAt: true, lastNotifiedAt: true, unsubscribeToken: true },
  });
  console.log('Active vehicle-context leads: ' + leads.length + (SEND ? '  [SEND MODE]' : '  [DRY RUN — no emails sent]'));

  // Canonical (make,model) pairs from published issues → match a lead's subject
  // robustly (handles multi-word makes/models, e.g. "Land Rover Range Rover").
  const pairs = await prisma.knownIssue.findMany({ where: { status: 'published' }, distinct: ['make', 'model'], select: { make: true, model: true } });
  const pairBySubject = new Map();
  for (const p of pairs) pairBySubject.set(`${p.make} ${p.model}`.toLowerCase().trim(), p);

  let resend = null;
  if (SEND) { const { Resend } = require('resend'); resend = new Resend(process.env.RESEND_API_KEY); }

  let sent = 0, skippedNoMatch = 0, skippedNoNew = 0, failed = 0;
  for (const lead of leads) {
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
    if (issues.length === 0) { skippedNoNew++; console.log('  · skip (nothing new): ' + lead.email + ' — ' + pair.make + ' ' + pair.model); continue; }

    // Ensure an unsubscribe token (backfill legacy rows captured before tokens).
    let token = lead.unsubscribeToken;
    if (!token) { token = randomBytes(24).toString('base64url'); await prisma.interestEmail.update({ where: { id: lead.id }, data: { unsubscribeToken: token } }); }

    const vehicle = `${pair.make} ${pair.model}`;
    const html = digestHtml({ vehicle, issues, slug: makeSlug(pair.make, pair.model), unsubToken: token, isCatchUp });
    const subjectLine = isCatchUp ? `Known issues for your ${vehicle} — au7o` : `New findings for your ${vehicle} — au7o`;

    if (!SEND) {
      console.log('  ✉  WOULD SEND → ' + lead.email + '  [' + vehicle + ', ' + issues.length + ' issue' + (issues.length > 1 ? 's' : '') + ']');
      for (const i of issues) console.log('       ' + sevDot(i.severity) + ' ' + i.title);
      continue;
    }
    try {
      await resend.emails.send({ from: FROM, to: lead.email, subject: subjectLine, html });
      await prisma.interestEmail.update({ where: { id: lead.id }, data: { lastNotifiedAt: new Date() } });
      sent++; console.log('  ✓ sent → ' + lead.email + ' (' + vehicle + ', ' + issues.length + ')');
    } catch (e) { failed++; console.error('  ! send failed → ' + lead.email + ': ' + (e instanceof Error ? e.message : e)); }
  }

  console.log('\n' + (SEND ? 'Sent ' + sent + ', ' : 'Dry run — ') + 'failed ' + failed + ', skipped ' + skippedNoMatch + ' (no vehicle match) + ' + skippedNoNew + ' (nothing new).');
  if (!SEND) console.log('Re-run with --send to actually email (requires RESEND_API_KEY + AU7O_MAILING_ADDRESS).');
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
