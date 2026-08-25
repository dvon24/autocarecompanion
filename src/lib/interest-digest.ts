import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';
import { loadSuppressed } from '@/lib/email-suppression';
import { sendEmail, appUrl } from '@/lib/email';
import { makeSlug } from '@/lib/known-issues';
import { getRecallsForArticle, type RecallItem } from '@/lib/recalls';

/**
 * Weekly vehicle-alert digest behind /api/cron/interest-digest.
 *
 * Every active address + vehicle subscription receives at most one email in a
 * Monday cohort. New or materially updated findings come first. If nothing has
 * changed since the prior send, the recipient still gets a useful current-
 * issues check-in, which prevents long-time subscribers from being silently
 * excluded while new signups receive catch-up mail.
 */

const MAX_PER_DIGEST = 10;
// Leave headroom under the route's maxDuration so the loop exits on its own
// terms. Raise both together if the list outgrows it.
const SEND_BUDGET_MS = 240_000;
const esc = (s: unknown) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

// NHTSA returns ReportReceivedDate as DD/MM/YYYY, which new Date() does not
// parse reliably.
function parseRecallDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const dm = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s).trim());
  const d = dm ? new Date(`${dm[3]}-${dm[2]}-${dm[1]}`) : new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function mondayUTC(now = new Date()): Date {
  const x = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = x.getUTCDay();
  x.setUTCDate(x.getUTCDate() - (day === 0 ? 6 : day - 1));
  return x;
}

/**
 * Severity → the colour of a row's left accent bar.
 *
 * The design uses a coloured spine beside each item instead of an icon, which
 * survives image-blocking clients where an icon would leave a grey box.
 */
const sevBar = (sev: string) => (
  sev === 'critical' || sev === 'high' ? '#DC2626' : sev === 'medium' ? '#D97706' : '#94A3B8'
);
const sevLabel = (sev: string) => (
  sev === 'critical' ? 'Critical' : sev === 'high' ? 'High' : sev === 'medium' ? 'Medium' : 'Low'
);

/** Exported so the layout can be rendered to disk for review without sending. */
export function buildDigestHtml(opts: {
  vehicle: string;
  issues: { id: string; title: string; severity: string }[];
  recalls: RecallItem[];
  slug: string;
  unsubToken: string;
  mode: 'catch-up' | 'new' | 'weekly' | 'researching';
  /**
   * Absolute https:// URL of a hero image for this vehicle, when one exists.
   *
   * Deliberately optional and deliberately absent today. The design this is
   * built from leads with a per-vehicle render, but the list spans 109 distinct
   * vehicles and /public/vehicles holds 17 images, none of which match the most
   * requested cars. Rendering a Challenger above a Nautilus owner's findings is
   * worse than rendering no photo at all, so the block only appears when a real
   * match is passed in. Wiring generated heroes in later is a one-argument
   * change, not a redesign.
   */
  heroUrl?: string;
}): string {
  const { vehicle, issues, recalls, slug, unsubToken, mode, heroUrl } = opts;
  const base = appUrl();
  const mailing = process.env.AU7O_MAILING_ADDRESS || '';
  const url = `${base}/known-issues/${slug}`;
  const unsub = `${base}/api/interest/unsubscribe?token=${encodeURIComponent(unsubToken)}`;

  const n = issues.length;
  const heading = mode === 'catch-up'
    ? `What we know<br>about your ${esc(vehicle)}.`
    : mode === 'weekly'
      ? `This week on<br>your ${esc(vehicle)}.`
      : mode === 'researching'
        ? `Still digging on<br>your ${esc(vehicle)}.`
        : `${n === 1 ? 'One new finding' : `${n} new findings`}<br>on your ${esc(vehicle)}.`;

  const intro = mode === 'catch-up'
    ? `You asked us to keep you posted. Here is everything we have documented so far, worst first.`
    : mode === 'weekly'
      ? `Nothing newly published this week, so here are the issues most worth keeping on your radar.`
      : mode === 'researching'
        ? `No newly verified finding is ready to publish this week. Your alert stays active and we keep checking primary sources for your vehicle.`
        : `Here is what is new or materially updated since we last checked in.`;

  // Preheader: the line a client shows beside the subject. Kept factual so it
  // reads as information rather than a teaser.
  const preheader = recalls.length > 0
    ? `${recalls.length} open safety recall${recalls.length > 1 ? 's' : ''} plus ${n} documented issue${n === 1 ? '' : 's'} - free fix at the dealer.`
    : `${n} documented issue${n === 1 ? '' : 's'} on your ${esc(vehicle)}, worst first.`;

  const hero = !heroUrl ? '' : `
<tr><td class="px" style="padding:0 30px">
  <img src="${esc(heroUrl)}" width="536" alt="${esc(vehicle)}" style="display:block;width:100%;max-width:536px;height:auto;border:0;outline:none;text-decoration:none;border-radius:12px">
</td></tr>`;

  // One row per issue: severity spine, title, severity word. Mirrors the
  // design's overdue rows, with severity standing in for the price column
  // because nothing in the catalog carries a cost for a lead's vehicle.
  const rows = issues.map((i, idx) => {
    const isLast = idx === issues.length - 1;
    // A hairline between items, matching the masthead rule. Each finding is a
    // separate documented fault, and without a divider a two-line title reads
    // as continuing into the next one.
    const cell = `padding:${idx === 0 ? '0' : '13px'} 0 ${isLast ? '0' : '13px'};`
      + (isLast ? '' : 'border-bottom:1px solid #E9E2D4;');
    return `
  <tr><td style="${cell}">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tbody><tr>
      <td width="4" bgcolor="${sevBar(i.severity)}" style="width:4px;background-color:${sevBar(i.severity)};border-radius:3px;font-size:0;line-height:0">&nbsp;</td>
      <td width="12" style="width:12px">&nbsp;</td>
      <td>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tbody><tr>
          <td align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:14.5px;line-height:20px;font-weight:bold;color:#0B1220;mso-line-height-rule:exactly">
            <a href="${url}#${i.id}" style="color:#0B1220;text-decoration:none">${esc(i.title)}</a>
          </td>
          <td align="right" width="74" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:20px;font-weight:bold;color:${sevBar(i.severity)};text-transform:uppercase;letter-spacing:.6px;white-space:nowrap;mso-line-height-rule:exactly">${sevLabel(i.severity)}</td>
        </tr>
        </tbody></table>
      </td>
    </tr>
    </tbody></table>
  </td></tr>`;
  }).join('');

  const issuesBlock = n === 0 ? '' : `
<tr><td class="px" style="padding:26px 30px 0">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tbody><tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1.1px;text-transform:uppercase;color:#8A6D3B;padding-bottom:12px;mso-line-height-rule:exactly;line-height:16px">${mode === 'new' ? 'New findings' : 'Documented issues'} &middot; ${n}</td></tr>
  ${rows}
  </tbody></table>
</td></tr>`;

  // Recalls take the visual slot the design gives "The road ahead": a bordered
  // panel with its own heading. A recall is the one item here with a free,
  // dealer-performed fix, so it leads.
  const recallBlock = recalls.length === 0 ? '' : `
<tr><td class="px" style="padding:26px 30px 0">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FEF2F2;border:1px solid #FECACA;border-radius:12px">
  <tbody><tr><td style="padding:16px 18px">
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:12.5px;font-weight:bold;color:#B91C1C;letter-spacing:.2px;mso-line-height-rule:exactly;line-height:18px">${recalls.length} open safety recall${recalls.length > 1 ? 's' : ''} &middot; free fix at the dealer</div>
    ${recalls.map((r) => `<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#0B1220;margin-top:9px;line-height:19px;mso-line-height-rule:exactly"><b>${esc(r.component || 'Recall')}</b> &mdash; ${esc((r.summary || '').slice(0, 140))}${(r.summary || '').length > 140 ? '&hellip;' : ''}</div>`).join('')}
    <div style="margin-top:12px"><a href="https://www.nhtsa.gov/recalls" style="font-family:Arial,Helvetica,sans-serif;font-size:12.5px;font-weight:bold;color:#B91C1C;text-decoration:underline">Check your VIN and book the free repair &rarr;</a></div>
  </td></tr>
  </tbody></table>
</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Au7o &mdash; ${esc(vehicle)}</title>
<!--[if mso]><style>body,table,td,a{font-family:Arial,Helvetica,sans-serif !important}</style><![endif]-->
<style>
@media only screen and (max-width:620px){
.w-full{width:100% !important}
.px{padding-left:20px !important;padding-right:20px !important}
.h1{font-size:26px !important;line-height:31px !important}
}
a{color:#2563EB}
</style>
</head>
<body style="margin:0;padding:0;background-color:#EDEAE2;">

<span style="display:none;font-size:1px;color:#EDEAE2;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#EDEAE2;">
<tbody><tr><td align="center" style="padding:26px 12px 34px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="w-full" style="width:600px;max-width:600px;background-color:#FAF7F0;border:1px solid #E4DED0;border-radius:14px;">

<tr><td class="px" style="padding:20px 30px 18px;border-bottom:1px solid #E9E2D4;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tbody><tr>
    <td align="left">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tbody><tr>
        <td width="30" style="width:30px;line-height:0;font-size:0"><img src="${base}/icons/icon-192.png" width="28" height="28" alt="" style="display:block;width:28px;height:28px;border:0;outline:none;text-decoration:none;border-radius:7px"></td>
        <td width="9" style="width:9px">&nbsp;</td>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:bold;letter-spacing:-0.4px;color:#0B1220;">Au<span style="color:#2563EB;">7</span>o</td>
      </tr>
      </tbody></table>
    </td>
    <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:10.5px;font-weight:bold;letter-spacing:1.1px;text-transform:uppercase;color:#8A6D3B;">Vehicle check-in</td>
  </tr>
  </tbody></table>
</td></tr>

<tr><td class="px" style="padding:30px 30px 0;">
  <h1 class="h1" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:30px;line-height:35px;font-weight:bold;letter-spacing:-1px;color:#0B1220;mso-line-height-rule:exactly;">${heading}</h1>
  <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#3F4A5C;mso-line-height-rule:exactly;">${intro}</p>
</td></tr>
${hero ? `<tr><td style="height:22px;line-height:22px;font-size:0">&nbsp;</td></tr>${hero}` : ''}
${recallBlock}
${issuesBlock}

<tr><td class="px" align="left" style="padding:26px 30px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tbody><tr><td bgcolor="#0B1220" style="background-color:#0B1220;border-radius:11px;padding:14px 24px;">
    <a href="${url}" style="display:block;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:-0.2px;">See all known issues &rarr;</a>
  </td></tr>
  </tbody></table>
</td></tr>

<tr><td class="px" style="padding:0 30px 30px;">&nbsp;</td></tr>

</tbody></table>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="w-full" style="width:600px;max-width:600px;">
<tbody><tr><td align="center" style="padding:18px 24px 0;font-family:Arial,Helvetica,sans-serif;font-size:11.5px;line-height:18px;color:#8A8D8A;mso-line-height-rule:exactly;">
  You are getting this because you asked Au7o to alert you about findings for your ${esc(vehicle)}. We send one vehicle check-in on Mondays.<br>
  ${mailing ? `${esc(mailing)}<br>` : ''}
  <a href="${unsub}" style="color:#6B7280;text-decoration:underline;">Unsubscribe</a>
</td></tr>
</tbody></table>

</td></tr>
</tbody></table>

</body></html>`;
}

export interface DigestResult {
  sent: number;
  failed: number;
  skippedNoMatch: number;
  skippedNoNew: number;
  skippedAlreadySentThisWeek: number;
  deduplicated: number;
  /** Eligible recipients the run ran out of time for. They sort to the front of
   *  the next run, so a non-zero value here is a backlog, not a loss — but a
   *  persistently non-zero value means the budget needs raising. */
  skippedOutOfTime: number;
  reason?: string;
}

export async function runInterestDigest(): Promise<DigestResult> {
  const result: DigestResult = {
    sent: 0,
    failed: 0,
    skippedNoMatch: 0,
    skippedNoNew: 0,
    skippedAlreadySentThisWeek: 0,
    deduplicated: 0,
    skippedOutOfTime: 0,
  };
  if (!process.env.AU7O_MAILING_ADDRESS) {
    result.reason = 'AU7O_MAILING_ADDRESS not set - refusing to send.';
    return result;
  }
  if (!process.env.RESEND_API_KEY) {
    result.reason = 'RESEND_API_KEY not set - nothing sent.';
    return result;
  }

  const leads = await prisma.interestEmail.findMany({
    where: { unsubscribedAt: null, context: { startsWith: 'known-issues:' } },
    // Deterministic order. Without it Postgres returns rows in physical order,
    // which is stable enough that a truncated run chops the SAME tail every
    // week — see the sort of `eligible` below for why that was so damaging.
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      context: true,
      createdAt: true,
      lastNotifiedAt: true,
      unsubscribeToken: true,
    },
  });

  // Drop addresses proven dead before the loop spends any of its time budget on
  // them. sendEmail() also refuses these, but that check happens per-send and
  // after the per-lead work; filtering here keeps the budget for real leads.
  // ONE query for the whole list. Empty set on a DB fault (fail-open).
  const suppressed = await loadSuppressed(leads.map((l) => l.email));
  const liveLeads = suppressed.size === 0
    ? leads
    : leads.filter((l) => !suppressed.has(l.email.trim().toLowerCase()));
  if (suppressed.size > 0) {
    console.warn(
      `[interest-digest] skipping ${leads.length - liveLeads.length} lead row(s) on the ` +
      `suppression list (hard bounce or spam complaint)`,
    );
  }

  // Repeated submissions of the same address + vehicle are one subscription.
  // The newest watermark prevents an older duplicate from triggering a resend.
  const grouped = new Map<string, {
    lead: (typeof leads)[number];
    ids: string[];
    lastNotifiedAt: Date | null;
  }>();
  for (const lead of liveLeads) {
    const key = `${lead.email.trim().toLowerCase()}\u0000${String(lead.context || '').trim().toLowerCase()}`;
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, {
        lead,
        ids: [lead.id],
        lastNotifiedAt: lead.lastNotifiedAt ? new Date(lead.lastNotifiedAt) : null,
      });
      continue;
    }
    existing.ids.push(lead.id);
    if (
      lead.lastNotifiedAt &&
      (!existing.lastNotifiedAt || new Date(lead.lastNotifiedAt) > existing.lastNotifiedAt)
    ) {
      existing.lastNotifiedAt = new Date(lead.lastNotifiedAt);
    }
    if (!existing.lead.unsubscribeToken && lead.unsubscribeToken) existing.lead = lead;
  }
  result.deduplicated = leads.length - grouped.size;

  // Everyone active when the cron runs is eligible unless that exact address +
  // vehicle already received this Monday's campaign. This also includes people
  // who sign up on Monday before the 14:00 UTC cron.
  const weekStart = mondayUTC();
  const groups = [...grouped.values()];
  result.skippedAlreadySentThisWeek = groups.filter(
    (group) => group.lastNotifiedAt && group.lastNotifiedAt >= weekStart,
  ).length;
  // Longest-waiting first, never-emailed before everyone.
  //
  // This is the fix for the starvation found on 2026-08-21. The loop below is
  // bounded by the function timeout, and the old unordered pass always spent
  // that budget on the same early rows — so the leads it never reached were
  // always the NEWEST signups. 63 of 174 leads had never received a single
  // email, including every single person who signed up after 2026-08-05: the
  // highest-intent people on the list, who had just asked to hear from us.
  // Draining oldest-watermark-first means a truncated run resumes where it
  // stopped instead of replaying the same head forever.
  const eligible = groups
    .filter((group) => !group.lastNotifiedAt || group.lastNotifiedAt < weekStart)
    .sort((a, b) => {
      if (!a.lastNotifiedAt && !b.lastNotifiedAt) {
        return a.lead.createdAt.getTime() - b.lead.createdAt.getTime();
      }
      if (!a.lastNotifiedAt) return -1;
      if (!b.lastNotifiedAt) return 1;
      return a.lastNotifiedAt.getTime() - b.lastNotifiedAt.getTime();
    });

  const pairs = await prisma.knownIssue.findMany({
    distinct: ['make', 'model'],
    select: { make: true, model: true },
  });
  const pairBySubject = new Map<string, { make: string; model: string }>();
  for (const pair of pairs) {
    pairBySubject.set(`${pair.make} ${pair.model}`.toLowerCase().trim(), pair);
  }

  // One NHTSA round-trip and one years query PER VEHICLE, not per lead. 174
  // leads are only ~111 distinct vehicles, and duplicates (four separate
  // Cadillac XT6 leads) each paid for their own network call. This was the
  // dominant per-lead cost: the 2026-08-17 run averaged 0.63s/lead and died at
  // the timeout having sent 92 of 155.
  const recallCache = new Map<string, RecallItem[]>();
  const recallsForVehicle = async (make: string, model: string): Promise<RecallItem[]> => {
    const key = `${make}\u0000${model}`;
    const cached = recallCache.get(key);
    if (cached) return cached;
    let all: RecallItem[] = [];
    try {
      const yearRows = await prisma.knownIssue.findMany({
        where: { make, model },
        select: { years: true },
      });
      const years = [...new Set(yearRows.flatMap((row) => row.years || []))]
        .sort((a, b) => b - a)
        .slice(0, 8);
      if (years.length > 0) all = await getRecallsForArticle(make, model, years);
    } catch {
      // Recall enrichment is additive and must never block the digest.
    }
    recallCache.set(key, all);
    return all;
  };

  // Stop cleanly with time to spare rather than being killed mid-iteration.
  // A hard kill loses the watermark write for the email it just sent, which
  // would mail that person twice next week.
  const startedAt = Date.now();
  let processed = 0;

  for (const group of eligible) {
    if (Date.now() - startedAt > SEND_BUDGET_MS) {
      result.skippedOutOfTime = eligible.length - processed;
      console.warn(
        `[interest-digest] time budget reached after ${processed} of ${eligible.length}; ` +
        `${result.skippedOutOfTime} carry over to the next run (they sort first).`,
      );
      break;
    }
    processed++;
    const lead = group.lead;
    const subject = String(lead.context || '').slice('known-issues:'.length).trim();
    const pair = pairBySubject.get(subject.toLowerCase());
    if (!pair) {
      result.skippedNoMatch++;
      continue;
    }

    const since = group.lastNotifiedAt;
    const baseWhere = { status: 'published', make: pair.make, model: pair.model };
    const issues = await prisma.knownIssue.findMany({
      where: since ? { ...baseWhere, updatedAt: { gt: since } } : baseWhere,
      orderBy: [{ updatedAt: 'desc' }, { reportCount: 'desc' }],
      take: MAX_PER_DIGEST,
      select: { id: true, title: true, severity: true },
    });

    // The cutoff is per-lead (it depends on their watermark), so the cache
    // holds the unfiltered campaign list and the filter runs per recipient.
    const cutoff = since ? new Date(since) : new Date(Date.now() - 90 * 86400000);
    const recalls = (await recallsForVehicle(pair.make, pair.model))
      .filter((recall) => {
        const date = parseRecallDate(recall.reportDate);
        return Boolean(date && date > cutoff);
      })
      .slice(0, 5);

    let mode: 'catch-up' | 'new' | 'weekly' | 'researching' = !since
      ? 'catch-up'
      : issues.length > 0 || recalls.length > 0
        ? 'new'
        : 'weekly';
    if (mode === 'weekly') {
      issues.push(...await prisma.knownIssue.findMany({
        where: baseWhere,
        orderBy: [{ reportCount: 'desc' }, { updatedAt: 'desc' }],
        take: MAX_PER_DIGEST,
        select: { id: true, title: true, severity: true },
      }));
    }
    if (issues.length === 0 && recalls.length === 0) mode = 'researching';

    let token = lead.unsubscribeToken;
    if (!token) {
      token = randomBytes(24).toString('base64url');
      await prisma.interestEmail.update({
        where: { id: lead.id },
        data: { unsubscribeToken: token },
      });
    }

    const vehicle = `${pair.make} ${pair.model}`;
    const html = buildDigestHtml({
      vehicle,
      issues,
      recalls,
      slug: makeSlug(pair.make, pair.model),
      unsubToken: token,
      mode,
    });
    const subjectLine = recalls.length > 0
      ? `Safety recall for your ${vehicle} - au7o`
      : mode === 'catch-up'
        ? `Known issues for your ${vehicle} - au7o`
        : mode === 'weekly'
          ? `Your weekly ${vehicle} check-in - au7o`
          : mode === 'researching'
            ? `We are still reviewing your ${vehicle} - au7o`
            : `New findings for your ${vehicle} - au7o`;
    const ok = await sendEmail({ to: lead.email, subject: subjectLine, html });
    if (!ok) {
      result.failed++;
      continue;
    }
    await prisma.interestEmail.updateMany({
      where: { id: { in: group.ids } },
      data: { lastNotifiedAt: new Date() },
    });
    result.sent++;
  }
  return result;
}
