#!/usr/bin/env node
/**
 * One-time Vehicle Twin return campaign.
 *
 * Dry-run is the default. A real send requires BOTH --send and the exact
 * confirmation token below; the operator must still obtain Devon's final
 * approval after reviewing the dry-run counts and previews.
 *
 *   node scripts/send-twin-launch-email.js --preview-dir outputs/twin-launch-preview
 *   node scripts/send-twin-launch-email.js --test=devon@example.com
 *   node scripts/send-twin-launch-email.js --send --confirm=SEND_TWIN_LAUNCH_2026_08
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const CAMPAIGN = 'twin-launch-2026-08';
const CONFIRM = 'SEND_TWIN_LAUNCH_2026_08';
const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const value = (flag, fallback = '') => {
  const exact = argv.find((arg) => arg.startsWith(flag + '='));
  if (exact) return exact.slice(flag.length + 1);
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const SEND = has('--send');
const TEST_TO = value('--test') || null;
const CONFIRM_VALUE = value('--confirm');
const PREVIEW_DIR = value('--preview-dir');
const LIMIT_PROVIDED = argv.some((arg) => arg === '--limit' || arg.startsWith('--limit='));
const LIMIT_VALUE = value('--limit');
const LIMIT_VALID = !LIMIT_PROVIDED || /^[1-9]\d*$/.test(LIMIT_VALUE);
const LIMIT = LIMIT_VALID && LIMIT_PROVIDED ? Number(LIMIT_VALUE) : 0;
const APP_URL = String(process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://au7o.io').replace(/\/+$/, '');
const FROM = process.env.FROM_EMAIL || 'Au7o <onboarding@resend.dev>';
const HAS_EXPLICIT_FROM = Boolean(String(process.env.FROM_EMAIL || '').trim());
const MAILING_ADDRESS = process.env.AU7O_MAILING_ADDRESS || '';
const CHALLENGER_IMAGE = process.env.TWIN_LAUNCH_CHALLENGER_IMAGE_URL || `${APP_URL}/twin-stage/email-techtree.webp`;
const NAUTILUS_IMAGE = process.env.TWIN_LAUNCH_NAUTILUS_IMAGE_URL || `${APP_URL}/twin-stage/email-techtree-nautilus.webp`;
const SUBJECT = "Your car's weak spots, mapped — reserve your Au7o twin";

const esc = (raw) => String(raw == null ? '' : raw)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const canon = (raw) => String(raw || '').trim().toLowerCase().replace(/[\s_-]+/g, ' ');
const canonEmail = (raw) => String(raw || '').trim().toLowerCase();
const validEmail = (raw) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(raw || '').trim());
const hashEmail = (email) => crypto.createHash('sha256').update(email).digest('hex').slice(0, 24);

function loadMakes() {
  const ymmt = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'ymmt.json'), 'utf8'));
  const makes = new Set();
  for (const year of Object.keys(ymmt)) for (const make of Object.keys(ymmt[year] || {})) makes.add(make);
  return [...makes].sort((a, b) => b.length - a.length);
}

function splitMakeModel(label, makes) {
  const target = canon(label);
  for (const make of makes) {
    const prefix = canon(make);
    if (target === prefix) return { make, model: null };
    if (target.startsWith(prefix + ' ')) return { make, model: label.trim().slice(make.length).trim() || null };
  }
  return { make: null, model: null };
}

function reserveUrl(make, model) {
  const q = new URLSearchParams();
  if (make) q.set('make', make);
  if (model) q.set('model', model);
  q.set('source', 'twin-launch-email');
  return `${APP_URL}/${q.size ? `?${q.toString()}` : ''}#reserve`;
}

function severityDot(severity) {
  const s = canon(severity);
  if (s === 'critical' || s === 'high') return '#E5484D';
  if (s === 'medium' || s === 'moderate') return '#D9822B';
  return '#64748B';
}

function emailHtml({ vehicle, variant, imageUrl, ctaUrl, unsubscribeUrl, issues }) {
  const car = vehicle || (variant === 'nautilus' ? 'Lincoln Nautilus' : 'vehicle');
  const issueRows = issues.length ? issues.slice(0, 3).map((issue) => `
    <tr><td style="padding:10px 0;border-bottom:1px solid #E8E5DC;font:600 13px/1.4 Arial,sans-serif;color:#0B1220">
      <span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:${severityDot(issue.severity)};margin-right:8px"></span>${esc(issue.title)}
    </td></tr>`).join('') : `
    <tr><td style="padding:10px 0;font:13px/1.5 Arial,sans-serif;color:#475569">Au7o maps the documented weak spots, maintenance windows, and verified repair parts for the vehicle you asked us about.</td></tr>`;
  return `<!doctype html><html><body style="margin:0;background:#F7F6F2">
  <div style="max-width:560px;margin:0 auto;padding:22px 14px;font-family:Arial,Helvetica,sans-serif;color:#0B1220">
    <div style="font-size:17px;font-weight:800;margin:0 0 10px"><img src="${APP_URL}/icons/icon-192.png" width="28" height="28" alt="" style="border-radius:7px;vertical-align:middle;margin-right:8px">au7o <span style="font-size:10px;color:#64748B;letter-spacing:.08em;text-transform:uppercase">Vehicle Twin preview</span></div>
    <div style="background:#fff;border:1px solid #E3DFD4;border-radius:16px;overflow:hidden">
      <a href="${esc(ctaUrl)}"><img src="${esc(imageUrl)}" width="560" alt="An Au7o vehicle twin showing clickable weak spots" style="display:block;width:100%;height:auto;border:0;background:#090D14"></a>
      <div style="padding:22px">
        <div style="font-size:11px;font-weight:700;color:#2563EB;letter-spacing:.08em;text-transform:uppercase">You asked about a ${esc(car)}</div>
        <h1 style="font-size:24px;line-height:1.12;letter-spacing:-.6px;margin:7px 0 10px">See the weak spots before they become surprises.</h1>
        <p style="font-size:14px;line-height:1.55;color:#475569;margin:0 0 14px">Tap a part of the visual twin to open its tech tree: what tends to fail, when service is due, what the repair takes, and verified parts that fit.</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 18px">${issueRows}</table>
        <a href="${esc(ctaUrl)}" style="display:block;text-align:center;background:#0B1220;color:#fff;text-decoration:none;border-radius:11px;padding:13px 18px;font-size:15px;font-weight:700">Reserve your ${esc(car)} twin →</a>
        <p style="font-size:12px;line-height:1.5;color:#64748B;margin:13px 0 0">The Challenger twin is live now. Other vehicles are built in the order owners reserve them. Your vehicle is prefilled; choose the year and trim to vote for the right build.</p>
      </div>
    </div>
    <p style="font-size:11px;line-height:1.55;text-align:center;color:#94A3B8;margin:15px 8px 0">You received this because you asked Au7o for vehicle findings. This is a one-time Vehicle Twin preview.<br><a href="${esc(unsubscribeUrl)}" style="color:#64748B">Unsubscribe</a>${MAILING_ADDRESS ? ` · ${esc(MAILING_ADDRESS)}` : ''}</p>
  </div></body></html>`;
}

function emailText({ vehicle, ctaUrl, unsubscribeUrl, issues }) {
  const rows = issues.slice(0, 3).map((issue) => `- ${issue.title}`).join('\n');
  return `See the weak spots before they become surprises.\n\nAu7o is building a visual tech tree for your ${vehicle || 'vehicle'}: known issues, maintenance windows, repair steps, and verified-fit parts.\n\n${rows ? `A few documented issues:\n${rows}\n\n` : ''}Reserve your twin: ${ctaUrl}\n\nThis is a one-time Vehicle Twin preview. Unsubscribe: ${unsubscribeUrl}${MAILING_ADDRESS ? `\n${MAILING_ADDRESS}` : ''}`;
}

async function assetMissing(imageUrl) {
  // Before a real send, the deployed HTTPS response is the source of truth —
  // a local file can exist while production still serves a 404. Dry-runs may
  // validate same-origin files locally so they can run before the deploy.
  if (SEND || !imageUrl.startsWith(APP_URL + '/')) {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD', signal: AbortSignal.timeout(10_000) });
      return !response.ok || !String(response.headers.get('content-type') || '').toLowerCase().startsWith('image/');
    } catch {
      return true;
    }
  }
  const rel = decodeURIComponent(new URL(imageUrl).pathname).replace(/^\/+/, '');
  return !fs.existsSync(path.join(__dirname, '..', 'public', rel));
}

(async () => {
  if (!LIMIT_VALID) throw new Error('--limit must be a positive whole number; refusing to expand a mistyped send to the full audience.');
  if (SEND && CONFIRM_VALUE !== CONFIRM) throw new Error(`Real send blocked: pass --confirm=${CONFIRM} after Devon approves the final dry-run.`);
  if ((SEND || TEST_TO) && !process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is required for a real or test send.');
  if ((SEND || TEST_TO) && !MAILING_ADDRESS) throw new Error('AU7O_MAILING_ADDRESS is required for CAN-SPAM compliance.');
  if (SEND && !HAS_EXPLICIT_FROM) throw new Error('FROM_EMAIL must be explicitly configured for a real campaign send.');
  if (![CHALLENGER_IMAGE, NAUTILUS_IMAGE].every((url) => /^https:\/\//i.test(url))) throw new Error('Both campaign image URLs must be hosted HTTPS URLs.');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const makes = loadMakes();
  // The additive column is deployed with this release. Dry-run must still work
  // before that schema push so Devon can review the audience first; a real send
  // fails closed until the durable one-time marker exists.
  const columnCheck = await pool.query(`SELECT COUNT(*) = 3 AS present
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'InterestEmail'
      AND column_name IN ('twinLaunchEmailedAt', 'twinLaunchPendingAt', 'twinLaunchPendingKey')`);
  const hasLaunchColumn = Boolean(columnCheck.rows[0] && columnCheck.rows[0].present);
  if (SEND && !hasLaunchColumn) throw new Error('The complete InterestEmail twin-launch send state is not deployed; refusing a non-idempotent campaign send.');
  const sentByEmail = new Set();
  const pendingByEmail = new Set();
  if (hasLaunchColumn) {
    const sentRows = await pool.query(`SELECT DISTINCT lower(email) AS email FROM "InterestEmail" WHERE "twinLaunchEmailedAt" IS NOT NULL`);
    for (const row of sentRows.rows) sentByEmail.add(canonEmail(row.email));
    const pendingRows = await pool.query(`SELECT DISTINCT lower(email) AS email FROM "InterestEmail" WHERE "twinLaunchPendingAt" IS NOT NULL`);
    for (const row of pendingRows.rows) pendingByEmail.add(canonEmail(row.email));
  }
  const leads = await prisma.interestEmail.findMany({
    where: { unsubscribedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, context: true, unsubscribeToken: true },
  });
  // Fail closed: if complaints/unsubscribes cannot be loaded, no campaign is
  // allowed to continue with an empty suppression list.
  const suppressedRows = await prisma.emailSuppression.findMany({ select: { email: true } });
  const suppressed = new Set(suppressedRows.map((row) => canonEmail(row.email)));
  const groups = new Map();
  for (const lead of leads) {
    const email = canonEmail(lead.email);
    const group = groups.get(email) || { email, leads: [], contexts: [], alreadySent: false, pending: false };
    group.leads.push(lead);
    if (lead.context) group.contexts.push(lead.context);
    if (sentByEmail.has(email)) group.alreadySent = true;
    if (pendingByEmail.has(email)) group.pending = true;
    groups.set(email, group);
  }

  const stats = { subscriptionRows: leads.length, unique: groups.size, invalid: 0, suppressed: 0, alreadySent: 0, pending: 0, nautilus: 0, challenger: 0, sendable: 0, missingToken: 0 };
  const candidates = [];
  const issueCache = new Map();
  for (const group of groups.values()) {
    if (!validEmail(group.email)) { stats.invalid++; continue; }
    if (suppressed.has(group.email)) { stats.suppressed++; continue; }
    if (group.alreadySent) { stats.alreadySent++; continue; }
    if (group.pending) { stats.pending++; continue; }
    const labels = group.contexts.filter((ctx) => String(ctx).startsWith('known-issues:')).map((ctx) => String(ctx).slice('known-issues:'.length).trim()).filter(Boolean);
    const isNautilus = labels.some((label) => canon(label) === 'lincoln nautilus');
    const variant = isNautilus ? 'nautilus' : 'challenger';
    // Art, copy, issue rows, and CTA must describe the same vehicle. If this
    // recipient has several contexts and one is Nautilus, use that label as
    // the primary instead of wrapping another car's copy in Nautilus art.
    const preferred = isNautilus
      ? (labels.find((label) => canon(label) === 'lincoln nautilus') || '')
      : (labels[0] || '');
    const { make, model } = preferred ? splitMakeModel(preferred, makes) : { make: null, model: null };
    stats[variant]++;
    const primary = group.leads.find((lead) => lead.unsubscribeToken) || group.leads[0];
    if (!primary.unsubscribeToken) stats.missingToken++;
    const cacheKey = make && model ? `${make}\u0000${model}` : '';
    let issues = [];
    if (cacheKey) {
      if (!issueCache.has(cacheKey)) issueCache.set(cacheKey, await prisma.knownIssue.findMany({ where: { status: 'published', make, model }, orderBy: { createdAt: 'desc' }, take: 3, select: { title: true, severity: true } }));
      issues = issueCache.get(cacheKey);
    }
    candidates.push({ group, primary, vehicle: preferred || null, make, model, variant, issues, imageUrl: variant === 'nautilus' ? NAUTILUS_IMAGE : CHALLENGER_IMAGE });
  }
  stats.sendable = candidates.length;

  const uniqueImages = [...new Set(candidates.map((c) => c.imageUrl))];
  const imageChecks = await Promise.all(uniqueImages.map(async (url) => ({ url, missing: await assetMissing(url) })));
  const missingImages = imageChecks.filter((check) => check.missing).map((check) => check.url);
  const plannedSend = TEST_TO ? 1 : (LIMIT ? Math.min(LIMIT, candidates.length) : candidates.length);
  console.log(JSON.stringify({ campaign: CAMPAIGN, mode: TEST_TO ? 'test' : SEND ? 'send' : 'dry-run', subject: SUBJECT, from: FROM, stats, plannedSend, limit: LIMIT || null, missingImages }, null, 2));
  if (missingImages.length) console.error(`BLOCKED IMAGE ASSET: ${missingImages.join(', ')}`);

  if (PREVIEW_DIR) {
    fs.mkdirSync(PREVIEW_DIR, { recursive: true });
    const samples = {
      challenger: { vehicle:'2015 Dodge Challenger SRT 392', make:'Dodge', model:'Challenger', variant:'challenger', issues:[], imageUrl:CHALLENGER_IMAGE },
      nautilus: { vehicle:'2019 Lincoln Nautilus', make:'Lincoln', model:'Nautilus', variant:'nautilus', issues:[], imageUrl:NAUTILUS_IMAGE },
    };
    for (const variant of ['challenger', 'nautilus']) {
      const sample = samples[variant];
      const unsubscribeUrl = `${APP_URL}/api/interest/unsubscribe?token=PREVIEW_TOKEN`;
      fs.writeFileSync(path.join(PREVIEW_DIR, `${variant}.html`), emailHtml({ ...sample, ctaUrl: reserveUrl(sample.make, sample.model), unsubscribeUrl }), 'utf8');
    }
  }

  if (!SEND && !TEST_TO) {
    await prisma.$disconnect(); await pool.end(); return;
  }
  if (missingImages.length) throw new Error('Send blocked until every campaign image exists at its hosted path.');

  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const selected = TEST_TO ? [{
    group: { email: TEST_TO },
    primary: { id: null, unsubscribeToken: null },
    vehicle: '2015 Dodge Challenger SRT 392', make: 'Dodge', model: 'Challenger',
    variant: 'challenger', issues: [], imageUrl: CHALLENGER_IMAGE, testOnly: true,
  }] : (LIMIT ? candidates.slice(0, LIMIT) : candidates);
  const isCurrentlySuppressed = async (email) => {
    const check = await pool.query(`SELECT EXISTS (
      SELECT 1 FROM "EmailSuppression"
      WHERE trim(lower(email)) = trim(lower($1))
      UNION ALL
      SELECT 1 FROM "InterestEmail"
      WHERE trim(lower(email)) = trim(lower($1))
        AND "unsubscribedAt" IS NOT NULL
    ) AS suppressed`, [email]);
    return Boolean(check.rows[0]?.suppressed);
  };
  let sent = 0, failed = 0, fatalError = null;
  for (const candidate of selected) {
    let token = candidate.testOnly ? 'TEST_ONLY_NO_SUBSCRIBER' : candidate.primary.unsubscribeToken;
    let claimKey = null;
    if (!candidate.testOnly) {
      if (await isCurrentlySuppressed(candidate.group.email)) {
        console.error(`SKIPPED ${candidate.group.email}: address is now unsubscribed or suppressed`);
        continue;
      }
      // Claim the address durably before handing it to the provider. This
      // prevents concurrent/retried runs from double-sending. A definitive
      // provider rejection releases only this run's claim; an ambiguous
      // network failure keeps it claimed and halts for reconciliation.
      claimKey = crypto.randomUUID();
      const claim = await pool.query(`UPDATE "InterestEmail"
        SET "twinLaunchPendingAt" = NOW(), "twinLaunchPendingKey" = $2
        WHERE trim(lower(email)) = trim(lower($1))
          AND "unsubscribedAt" IS NULL
          AND "twinLaunchEmailedAt" IS NULL
          AND "twinLaunchPendingAt" IS NULL
        RETURNING id`, [candidate.group.email, claimKey]);
      if (!claim.rowCount) {
        console.error(`SKIPPED ${candidate.group.email}: another run already claimed or sent this address`);
        continue;
      }
      if (!token) {
        try {
          const minted = crypto.randomBytes(24).toString('base64url');
          const tokenRow = await pool.query(`UPDATE "InterestEmail"
            SET "unsubscribeToken" = COALESCE("unsubscribeToken", $2)
            WHERE id = $1
            RETURNING "unsubscribeToken"`, [candidate.primary.id, minted]);
          token = tokenRow.rows[0]?.unsubscribeToken || null;
          if (!token) throw new Error('could not create a stable unsubscribe token');
        } catch (error) {
          await pool.query(`UPDATE "InterestEmail"
            SET "twinLaunchPendingAt" = NULL, "twinLaunchPendingKey" = NULL
            WHERE trim(lower(email)) = trim(lower($1))
              AND "twinLaunchPendingKey" = $2`, [candidate.group.email, claimKey]);
          throw error;
        }
      }
    }
    const ctaUrl = reserveUrl(candidate.make, candidate.model);
    const unsubscribeUrl = candidate.testOnly
      ? `${APP_URL}/privacy`
      : `${APP_URL}/api/interest/unsubscribe?token=${encodeURIComponent(token)}`;
    const payload = {
      from: FROM,
      to: TEST_TO || candidate.group.email,
      subject: TEST_TO ? `[TEST] ${SUBJECT}` : SUBJECT,
      html: emailHtml({ ...candidate, ctaUrl, unsubscribeUrl }),
      text: emailText({ ...candidate, ctaUrl, unsubscribeUrl }),
    };
    const idempotencyKey = candidate.testOnly
      ? `${CAMPAIGN}/test/${hashEmail(TEST_TO)}/${hashEmail(JSON.stringify(payload))}`
      : `${CAMPAIGN}/${hashEmail(candidate.group.email)}`;
    try {
      const result = await resend.emails.send(payload, { idempotencyKey });
      if (result.error) {
        if (claimKey) await pool.query(`UPDATE "InterestEmail"
          SET "twinLaunchPendingAt" = NULL, "twinLaunchPendingKey" = NULL
          WHERE trim(lower(email)) = trim(lower($1))
            AND "twinLaunchPendingKey" = $2`, [candidate.group.email, claimKey]);
        failed++;
        console.error(`FAILED ${candidate.group.email}: ${result.error.message || JSON.stringify(result.error)}`);
        continue;
      }
      if (claimKey) {
        const finalized = await pool.query(`UPDATE "InterestEmail"
          SET "twinLaunchEmailedAt" = NOW(),
              "twinLaunchPendingAt" = NULL,
              "twinLaunchPendingKey" = NULL
          WHERE trim(lower(email)) = trim(lower($1))
            AND "twinLaunchPendingKey" = $2
          RETURNING id`, [candidate.group.email, claimKey]);
        if (!finalized.rowCount) throw new Error('provider accepted the message, but its durable send claim could not be finalized');
      }
      sent++;
    } catch (error) {
      failed++;
      fatalError = new Error(`AMBIGUOUS SEND ${candidate.group.email}: provider outcome is unknown; the durable claim was kept for reconciliation. ${error instanceof Error ? error.message : String(error)}`);
      console.error(fatalError.message);
      break;
    }
    if (TEST_TO) break;
  }
  console.log(JSON.stringify({ sent, failed, test: Boolean(TEST_TO) }, null, 2));
  await prisma.$disconnect(); await pool.end();
  if (failed > 0) process.exitCode = 1;
  if (fatalError) throw fatalError;
})().catch((error) => { console.error(`FAIL: ${error.message}`); process.exitCode = 1; });
