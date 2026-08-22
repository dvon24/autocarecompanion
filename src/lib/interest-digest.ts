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
const sevDot = (sev: string) => (
  sev === 'critical' || sev === 'high' ? '&#128308;' : sev === 'medium' ? '&#128993;' : '&#9898;'
);

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

function buildDigestHtml(opts: {
  vehicle: string;
  issues: { id: string; title: string; severity: string }[];
  recalls: RecallItem[];
  slug: string;
  unsubToken: string;
  mode: 'catch-up' | 'new' | 'weekly' | 'researching';
}): string {
  const { vehicle, issues, recalls, slug, unsubToken, mode } = opts;
  const base = appUrl();
  const mailing = process.env.AU7O_MAILING_ADDRESS || '';
  const url = `${base}/known-issues/${slug}`;
  const unsub = `${base}/api/interest/unsubscribe?token=${encodeURIComponent(unsubToken)}`;
  const heading = mode === 'catch-up'
    ? `Known issues for your ${esc(vehicle)}`
    : mode === 'weekly'
      ? `Your weekly ${esc(vehicle)} check-in`
      : mode === 'researching'
        ? `We are still reviewing your ${esc(vehicle)}`
        : `New findings for your ${esc(vehicle)}`;
  const intro = mode === 'catch-up'
    ? `You asked us to keep you posted on your ${esc(vehicle)}. Here is what we have documented so far - worth a look:`
    : mode === 'weekly'
      ? `No newly published finding this week, so here are the current issues most worth keeping on your radar:`
      : mode === 'researching'
        ? `We do not have a newly verified finding ready to publish this week. Your alert remains active, and we will keep checking primary sources for your vehicle.`
        : `Here is what is new or materially updated for your ${esc(vehicle)} since we last checked in:`;
  const rows = issues.map((i) => `
    <tr><td style="padding:10px 0;border-bottom:1px solid #EEE;font-size:14px;line-height:1.4;color:#0B1220">
      <span style="margin-right:6px">${sevDot(i.severity)}</span>
      <a href="${url}#${i.id}" style="color:#0B1220;text-decoration:none;font-weight:600">${esc(i.title)}</a>
    </td></tr>`).join('');
  const recallBlock = recalls.length === 0 ? '' : `
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:14px 16px;margin:0 0 16px">
        <div style="font-size:13px;font-weight:800;color:#B91C1C;margin-bottom:8px">&#128737;&#65039; ${recalls.length} new safety recall${recalls.length > 1 ? 's' : ''} - free fix at the dealer</div>
        ${recalls.map((r) => `<div style="font-size:13px;color:#0B1220;margin:6px 0;line-height:1.4"><strong>${esc(r.component || 'Recall')}</strong> - ${esc((r.summary || '').slice(0, 140))}${(r.summary || '').length > 140 ? '&hellip;' : ''}</div>`).join('')}
        <a href="https://www.nhtsa.gov/recalls" style="display:inline-block;margin-top:8px;font-size:12.5px;font-weight:700;color:#B91C1C">Check your VIN + book the free repair &rarr;</a>
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
      <a href="${url}" style="display:inline-block;margin-top:18px;background:#0B1220;color:#fff;text-decoration:none;padding:11px 18px;border-radius:10px;font-size:14px;font-weight:700">See all known issues for your ${esc(vehicle)} &rarr;</a>
      <p style="font-size:13px;color:#64748B;margin:16px 0 0;line-height:1.5">Got a noise, leak, or warning light? Point your phone at it and the au7o mechanic will tell you what it is - <a href="${base}/diagnose" style="color:#2563EB">try a free diagnosis</a>.</p>
    </div>
    <p style="font-size:11px;color:#94A3B8;text-align:center;margin:16px 0 0;line-height:1.5">
      You are getting this because you asked au7o to alert you about findings for your ${esc(vehicle)}. We send one vehicle check-in on Mondays.<br>
      <a href="${unsub}" style="color:#94A3B8">Unsubscribe</a>${mailing ? ` &nbsp;&middot;&nbsp; ${esc(mailing)}` : ''}
    </p>
  </div></body></html>`;
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
    const key = `${make} ${model}`;
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
