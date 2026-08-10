import { NextRequest, NextResponse, after } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import {
  hubChatAnonDayLimiter,
  hubChatAuthedDayLimiter,
  hubChatMinuteLimiter,
  getClientIp,
  rateLimitResponse,
} from '@/lib/rate-limit';
import { mileageBucket } from '@/lib/vehicle-slug';
import {
  checkAndConsumeChatQuota,
  peekChatQuota,
  getOrSetAnonId,
  DEFAULT_ANON_LIMIT,
  getEffectiveFreeAuthedLimit,
  refundChatQuota,
} from '@/lib/chat-quota';
import { checkAiGate, isAiGateBlocked } from '@/lib/ai-gate';
import { resolveParts, type PartIntent } from '@/lib/resolve-parts';
import { warmVerifiedPart } from '@/lib/verified-parts';
import { resolvePartLink } from '@/lib/resolve-part-link';
import { getVehicleSpecs } from '@/lib/maintenance';
import { getWebSpecs } from '@/lib/verified-specs';
import { canonicalizePart } from '@/lib/part-vocabulary';
import { STATIC_SYSTEM_PROMPT } from '@/lib/hub-chat-prompt';
import type { PartCategory } from '@/types/vision';
import {
  getHubModelConfig,
  isUsableHubReply,
  requestHubModelWithTransportFallback,
  safeHubChatErrorMessage,
  shouldRetryHubModel,
} from '@/lib/hub-chat-model';

// A transport-level primary timeout can still be followed by one fallback
// attempt. Give both bounded 55-second requests room inside Vercel's function
// lifetime instead of terminating the fallback a few seconds after it starts.
export const maxDuration = 120;
export const runtime = 'nodejs';

/**
 * GET /api/hub-chat — peek the anonymous chat allowance WITHOUT
 * consuming it. The client-side counter (useAnonymousLimit, localStorage)
 * can drift from the server's authoritative per-identity weekly quota:
 * on a shared IP, after clearing storage, or after the credit was spent
 * on another surface, the client would otherwise promise "1 chat left"
 * that the server immediately rejects — the user clicks a CTA and gets
 * "no chats left" with no answer. This lets the client seed its display
 * from the server truth on load.
 *
 * Returns { authenticated, remaining, limit, resetAt }. Authenticated
 * users aren't anon-gated (remaining is null → client treats as
 * unlimited). Peek-only: never increments the quota.
 */
export async function GET() {
  let session;
  try { session = await auth(); } catch { session = null; }
  if (session?.user?.id) {
    return NextResponse.json({ authenticated: true, remaining: null });
  }
  try {
    const anonId = await getOrSetAnonId();
    const peek = await peekChatQuota({ key: `anon:${anonId}`, limit: DEFAULT_ANON_LIMIT });
    return NextResponse.json({
      authenticated: false,
      remaining: peek.remaining,
      limit: peek.limit,
      resetAt: peek.resetAt.toISOString(),
    });
  } catch {
    // On any failure, don't block the UI — let the client fall back to
    // its local counter.
    return NextResponse.json({ authenticated: false, remaining: null });
  }
}

/**
 * Hub chat endpoint — purpose-built for the conversation-first
 * /vehicle/[slug] surface. Distinct from the older /api/chat (which is
 * a heavyweight diagnostic flow with tool use); this one is shaped for
 * fast, streaming, vehicle-aware conversation with strict guardrails.
 *
 * Architecture notes:
 *   - OpenAI gpt-5.5 (migrated from Anthropic Sonnet 4.6 on 2026-05-30
 *     to consolidate Anthropic spend onto another project). OpenAI
 *     auto-caches system prompts >1024 tokens, so the ~90%-off posture
 *     on repeat system-prompt tokens is preserved — just no longer
 *     surfaced via explicit cache_control breakpoints.
 *   - Streams tokens back via SSE so the UI can render character-by-
 *     character — feels alive vs the dead-pause of a synchronous reply.
 *   - Every prompt logged to ChatPromptInsight (for trending/aggregation
 *     in batch 3) + persisted to ChatSession (for recent-threads rail).
 *   - Five guardrails baked in:
 *       1. XML-wrapped user input — the model treats anything in
 *          <user_message> as user input, never as instructions
 *       2. Topic scope in system prompt — refuse non-vehicle queries
 *       3. Hard 2k-token cap on input
 *       4. Anonymous conversion-trial IP limit (5/day) + authed cap (200/day)
 *       5. Per-minute burst cap (12/min) catches client retry loops
 *
 * Request body:
 *   {
 *     vehicle: { year, make, model, trim, currentMileage? },
 *     sessionId?: string,         // null on first turn, server returns one
 *     messages: [{ role, content }, ...]  // history, last entry = new user message
 *   }
 *
 * Response: SSE stream with events:
 *   { type: 'session', sessionId } — first event, session id to remember
 *   { type: 'token', text }        — each streamed token
 *   { type: 'done', usage }        — final event with usage stats
 *   { type: 'error', message }     — fatal error (rate limit, refusal, etc.)
 */

// Migrated off Anthropic Sonnet 4.6 → OpenAI gpt-5.5 (2026-05-30). User
// is using Sonnet on a different project and wanted to consolidate
// Anthropic spend out of this codebase. Caching: was using explicit
// Anthropic cache_control breakpoints on the system block (~90% off
// repeat system tokens); OpenAI does automatic prompt caching for any
// system prompt >1024 tokens, so the savings posture is preserved
// implicitly — just no longer surfaced in code.
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const HUB_MODELS = getHubModelConfig();
const MAX_INPUT_TOKENS = 2000;       // hard cap on user input per turn
const MAX_HISTORY_MESSAGES = 20;     // last N turns sent to the model
// 4000, not 1500: on gpt-5.x chat completions, REASONING tokens count
// against max_completion_tokens and this account's models burn 1-3k of
// them before the first content token (see vision/route.ts) — at 1500 the
// model could exhaust the whole budget reasoning and stream back an empty
// reply that still consumed the user's credit (2026-06-12 review finding).
const MAX_OUTPUT_TOKENS = 4000;

interface HubVehicle {
  year: number;
  make: string;
  model: string;
  trim?: string;
  currentMileage?: number;
}
interface HubMessage { role: 'user' | 'assistant'; content: string }
interface KnownIssueRef { id: string; title: string }
interface HubChatBody {
  vehicle?: HubVehicle;
  sessionId?: string;
  messages?: HubMessage[];
  /** Top KnownIssue titles for this vehicle, passed by the hub so the
   *  assistant can reference them by EXACT title (and the client can
   *  attach the matching card). Without this, the assistant invents
   *  paraphrased issue names that the substring matcher doesn't catch. */
  knownIssueTitles?: KnownIssueRef[];
  /** User's coarse geolocation (from sessionStorage cache) — used to
   *  reverse-geocode a city/country so trip suggestions don't default
   *  to US classics ("Blue Ridge Parkway") when the user is in
   *  Germany or anywhere else. Optional; trip suggestions just stay
   *  generic when missing. */
  userLocation?: { lng: number; lat: number };
}

// Rough token estimate without making a tokenizer call. Claude tokens
// run ~3.7 chars on average for English; 4 is a safe over-estimate
// that errs on the side of rejecting borderline-long prompts.
function estimateTokens(text: string): number {
  return Math.ceil((text || '').length / 4);
}

/**
 * STATIC system prompt — identical across every user, every vehicle,
 * every conversation. This is the block that gets ~90% off via Anthropic
 * prompt caching once warmed; cache hits across the entire user base.
 *
 * Anything vehicle- or user-specific MUST go in buildVehicleBlock() below
 * so this string never changes. If you find yourself wanting to
 * interpolate something here, ask first whether it actually has to live
 * in the cached block.
 */
// The system prompt now lives in its own reviewable/editable file.
// See src/lib/hub-chat-prompt.ts.

/**
 * VEHICLE-specific block — varies per vehicle but caches across users
 * who own / are researching the same vehicle. Second cache breakpoint.
 * At scale, popular vehicles (Camry, F-150, Civic) get repeated cache
 * hits across thousands of users.
 *
 * Includes the EXACT titles of documented KnownIssue records for this
 * vehicle. When the assistant references one of these, it MUST use the
 * exact title verbatim so the client's substring matcher can render
 * the inline issue card. Without this, the model invents paraphrased
 * names ("Sway bar end links" / "Header gaskets") that don't match
 * anything in our DB and the cards never render.
 */
function buildVehicleBlock(vehicle: HubVehicle, knownIssues: KnownIssueRef[], webSpecRows?: string[]): string {
  const v = vehicle;
  const mileage = v.currentMileage ? `, currently at ~${v.currentMileage.toLocaleString()} miles` : '';
  let block = `Active vehicle context: the user is asking about a ${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''}${mileage}. Use this make and model in every reply that references the car.`;

  // Ground fluid/spec answers so the model doesn't invent (and vary) fluid
  // types/capacities. Prefer the authoritative spec DB; if this vehicle isn't
  // in the DB, fall back to web-searched specs (verified-specs.getWebSpecs).
  // Without this the hub gave a different differential fluid spec every ask.
  try {
    let rows: string[] = [];
    let sourceLabel = "from Au7o's spec database";
    const specs = getVehicleSpecs({ year: v.year, make: v.make, model: v.model, trim: v.trim || '' });
    if (specs) {
      const fmt = (val: unknown): string =>
        val && typeof val === 'object'
          ? Object.entries(val as Record<string, unknown>)
              .map(([k, x]) => `${k}: ${x && typeof x === 'object' ? JSON.stringify(x) : String(x)}`)
              .join(', ')
          : String(val);
      const s = specs as unknown as Record<string, unknown>;
      const add = (label: string, key: string) => { if (s[key]) rows.push(`- ${label}: ${fmt(s[key])}`); };
      add('Engine oil', 'oil');
      add('Coolant', 'coolant');
      add('Transmission fluid', 'transmission');
      // Differential fluid: if it genuinely varies by axle/build, render the
      // STRUCTURED variants as a by-condition line (not a JSON blob or a prose
      // "varies" string the model would flatten into one wrong answer).
      const diffRear = (s.differentials as { rear?: { type?: string; capacity?: string; variants?: Array<{ spec: string; capacity?: string; condition: string }> } } | undefined)?.rear;
      if (diffRear?.variants?.length) {
        const parts = diffRear.variants.map((x) => `${x.spec}${x.capacity ? ` (${x.capacity})` : ''} for ${x.condition}`);
        rows.push(`- Differential fluid: VARIES BY AXLE — ${parts.join('; ')}. Tell the user it depends on their axle/build and to confirm by VIN if unsure; do NOT state a single value as if universal.`);
      } else {
        add('Differential fluid', 'differentials');
      }
      add('Brake fluid', 'brakeFluid');
      add('Spark plugs', 'sparkPlugs');
    }
    if (!rows.length && webSpecRows?.length) {
      rows = webSpecRows;
      sourceLabel = 'web-verified from manufacturer/service sources';
    }
    if (rows.length) {
      // Only claim "VERIFIED" when the block has actually had its audit pass
      // (carries provenance). Raw generated data gets an honest, softer header —
      // the word "verified" is a claim unaudited data can't back.
      const audited = !!(specs && (specs as { specProvenance?: unknown }).specProvenance);
      const header = audited
        ? `VERIFIED FACTORY SPECS for this exact ${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''} (${sourceLabel}, audited & source-cited)`
        : `Factory specs for this ${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''} (${sourceLabel} — not yet independently audited; treat as a strong default, not gospel)`;
      block += `\n\n${header}:
${rows.join('\n')}
When the user asks about a fluid type, weight, viscosity, capacity, or spec, use these EXACT values — do not invent, round, or vary them, and give the SAME answer every time. If a spec they ask about is NOT listed here, say you'd verify it by VIN rather than guessing.`;
    }
  } catch { /* specs optional — never block the reply */ }

  if (knownIssues.length > 0) {
    block += `\n\nDocumented known issues for this vehicle (from Au7o's database):
${knownIssues.map((i) => `- ${i.title}`).join('\n')}

CRITICAL rendering rule for these issues:
- When a user asks about common problems / known issues / what to look out for, your reply should be SHORT — one or two sentences setting context, then list the relevant issue titles VERBATIM (one per line, prefixed with "- "). The UI will replace the bolded titles with clickable cards that show severity, cost range, and link to the full article. DO NOT describe each issue in prose — the cards do that. Duplicating the description in your text creates clutter that obscures the cards.
- BAD example (don't do this):
  "Cooling: Water pumps fail. Look for coolant leaks. They cost $400-800 to replace."
- GOOD example (do this):
  "At 60k+ miles, these come up most often:
  - Water Pump Failure
  - Driveshaft / U-Joint Failure
  - HEMI Lifter Tick
  Cards below have the cost ranges and full repair guides."
- Use EXACT titles from the list above. If an issue isn't in the list, describe it briefly in prose (no bolding).
- Never paraphrase ("Header gaskets" instead of "HEMI Exhaust Manifold Bolt Failure" — the card won't render).`;
  }
  block += `\n\nAfter each substantive answer, suggest 2-3 short follow-up questions the user might naturally want to ask next. Format them at the very end of your reply on their own lines, one per line, starting with "→ " (arrow + space). Example:
→ How much does that cost to fix?
→ Can I do this myself?
→ What parts will I need?

Keep follow-ups under 8 words each. The UI will render them as clickable chips below your message.`;
  return block;
}

async function logPromptInsight(args: {
  vehicle: HubVehicle;
  prompt: string;
  vehicleId: string | null;
  userId: string | null;
  anonymousId: string | null;
}) {
  try {
    await prisma.chatPromptInsight.create({
      data: {
        vehicleYear: args.vehicle.year,
        make: args.vehicle.make,
        model: args.vehicle.model,
        trim: args.vehicle.trim || null,
        mileageBucket: mileageBucket(args.vehicle.currentMileage ?? null),
        prompt: args.prompt.slice(0, 2000), // store the bounded version
        intent: null,                        // backfilled by nightly cron
        promptTokens: estimateTokens(args.prompt),
        vehicleId: args.vehicleId,
        userId: args.userId,
        anonymousId: args.anonymousId,
      },
    });
  } catch (err) {
    console.warn('[hub-chat] insight log failed:', err);
  }
}

// ── Part-marker grounding ────────────────────────────────────────────────
// The model emits [[PART: name || category || brand || tier]] markers instead
// of writing part numbers / store URLs itself (the fabrication fix). We replace
// each marker IN THE STREAM with a grounded link via resolveParts — no model PN
// ever reaches the user, and retail links are descriptive (never a bare OEM PN).
const PART_MARK_OPEN = '[[PART:';

/** Resolve one marker's inner text ("name || category || brand || tier") into
 *  grounded markdown. useEbay:false keeps it synchronous-fast for the stream —
 *  so there is NO corroborated PN inline; we link the descriptive/affiliate
 *  buy URL and, for an OEM ask, add the honest verify-by-VIN fitment link. */
async function resolveMarkerToMarkdown(
  inner: string,
  vehicle: { year?: number; make?: string; model?: string; trim?: string },
  warmSet?: Set<string>,
): Promise<string> {
  const fields = inner.split('||').map((s) => s.trim());
  const partName = fields[0] || '';
  if (!partName) return '';
  const brand = fields[2] || undefined;
  const tier = fields[3] === 'aftermarket' ? 'aftermarket' : fields[3] === 'oem' ? 'oem' : undefined;
  const canon = canonicalizePart(partName);
  const category = fields[1] || canon?.category || undefined;

  // THE shared decision tree — same one vision calls. supply → verified record
  // store → miss (+ background warm queued). This is the "same workflow" contract.
  const r = await resolvePartLink({ partName, brand }, vehicle, warmSet);

  // Supply → its own clean generic Amazon link.
  if (r.kind === 'supply') return `**${r.displayName}** — [Amazon](${r.buyLinks[0].url})`;

  // Don't double the brand ("Mopar" + "Mopar OAT coolant" = "Mopar Mopar OAT").
  const label = brand && !r.displayName.toLowerCase().startsWith(brand.toLowerCase())
    ? `${brand} ${r.displayName}`
    : r.displayName;
  const aftNote = r.aftermarket.length
    ? ` _(aftermarket: ${r.aftermarket.slice(0, 2).map((a) => `${a.brand} ${a.partNumber}`).join(', ')})_`
    : '';

  // Verified record → primary verified deep link + up to 2 more stores for choice.
  if (r.kind === 'verified') {
    const pn = r.partNumber ? ` \`${r.partNumber}\`` : '';
    const links = r.buyLinks;
    const row = [`[${links[0].vendor} — verified](${links[0].url})`, ...links.slice(1).map((l) => `[${l.vendor}](${l.url})`)].join(' · ');
    const caveat = r.caveat ? ` _(${r.caveat})_` : '';
    return `**${label}**${pn} — ${row}${caveat}` + aftNote;
  }

  // Miss → one honest, working, correctly-tagged Amazon search (the hub's
  // surface-specific fallback; the warm has already been queued). If we don't
  // even have that, just name the part (no fake link).
  const intent: PartIntent = { partName: r.displayName, category: category as PartCategory | undefined, brand, tier };
  let card;
  try { [card] = await resolveParts([intent], vehicle, { useEbay: false }); } catch { /* */ }
  const isSearchEngineUrl = (u: string) => /(^https?:\/\/)?(www\.)?(google|bing|duckduckgo)\.[a-z.]+\/(search|s\?)/i.test(u);
  const amazonVl = card?.vendorLinks?.find((l) => /amazon/i.test(l.vendor) && !isSearchEngineUrl(l.url));
  if (!amazonVl) return `**${label}**`;
  return `**${label}** — [${amazonVl.displayName}](${amazonVl.url})` + aftNote;
}

/** Longest suffix of `s` that is a proper prefix of the marker opener — held
 *  back so a marker split across stream deltas isn't emitted raw. */
function partialOpenHold(s: string): number {
  const max = Math.min(s.length, PART_MARK_OPEN.length - 1);
  for (let k = max; k > 0; k--) {
    if (PART_MARK_OPEN.startsWith(s.slice(s.length - k))) return k;
  }
  return 0;
}

/** Neutralize any link the MODEL wrote in its prose (it's told to emit markers,
 *  never links — but it sometimes disobeys and writes a fabricated store/Google
 *  search URL). Keep the label, drop the URL. The resolver's grounded links are
 *  sent as separate tokens and never pass through here, so they survive. */
function stripModelLinks(s: string): string {
  return s
    .replace(/\[([^\]]*)\]\((?:[^)]*)\)/g, '$1') // [label](url) → label
    .replace(/\bhttps?:\/\/\S+/gi, '');           // any bare URL the model wrote
}

/** How many trailing chars to hold back so we never emit a markdown link that's
 *  still arriving across deltas (else stripModelLinks can't see it whole). */
function partialLinkHold(s: string): number {
  let m = s.match(/\[[^\]]*$/);            // '[' with no closing ']' yet
  if (m) return m[0].length;
  m = s.match(/\[[^\]]*\]\([^)]*$/);       // '[label](' with no closing ')' yet
  if (m) return m[0].length;
  return 0;
}

export async function POST(request: NextRequest) {
  if (!OPENAI_KEY) {
    return NextResponse.json({ error: 'service_unavailable', message: 'Chat is offline.' }, { status: 503 });
  }

  // ── 0. GDPR Art. 21 right-to-object check ────────────────────────
  // Signed-in users who toggled aiProcessingOptOut in Account
  // Settings short-circuit here — no data ever reaches OpenAI.
  const gate = await checkAiGate();
  if (isAiGateBlocked(gate)) return gate;

  // ── 1. Parse + validate body ─────────────────────────────────────
  let body: HubChatBody;
  try { body = (await request.json()) as HubChatBody; }
  catch { return NextResponse.json({ error: 'bad_json' }, { status: 400 }); }

  const v = body.vehicle;
  if (!v || typeof v.year !== 'number' || !v.make || !v.model) {
    return NextResponse.json({ error: 'missing_vehicle' }, { status: 400 });
  }
  // Sanitize the client-supplied history: only known roles, every turn
  // content-capped. Previously only the FINAL message was length-checked,
  // so prior array entries were forwarded to OpenAI with unbounded size
  // and arbitrary roles (2026-06-11 review finding).
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ ...m, content: m.content.slice(0, 8_000) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'no_user_message' }, { status: 400 });
  }
  const userMessage = messages[messages.length - 1].content || '';
  if (!userMessage.trim()) {
    return NextResponse.json({ error: 'empty_message' }, { status: 400 });
  }

  // ── 2. Guardrail: hard input-token cap ───────────────────────────
  if (estimateTokens(userMessage) > MAX_INPUT_TOKENS) {
    return NextResponse.json(
      { error: 'message_too_long', message: 'Please trim your message — about 1,500 words max per turn.' },
      { status: 413 },
    );
  }

  // ── 3. Auth + rate limit ─────────────────────────────────────────
  const ip = getClientIp(request);
  let session;
  try { session = await auth(); } catch { session = null; }
  const isAuthed = !!session?.user?.id;
  const userId = session?.user?.id || null;

  // Burst protection — applies to everyone.
  const burstLimit = hubChatMinuteLimiter.check(ip);
  if (!burstLimit.success) return rateLimitResponse(burstLimit.reset);

  // Daily cap — anonymous visitors can use their full five-message trial in
  // one sitting; the weekly cookie-backed quota below is authoritative.
  const dayLimiter = isAuthed ? hubChatAuthedDayLimiter : hubChatAnonDayLimiter;
  const dayLimit = dayLimiter.check(ip);
  if (!dayLimit.success) {
    if (isAuthed) {
      return NextResponse.json({ error: 'rate_limited', message: 'Daily chat limit reached. It resets in 24 hours.', reset: dayLimit.reset, gated: false }, { status: 429 });
    }
    // Anonymous trial is exhausted: signup is the primary next step.
    return NextResponse.json({
      error: 'login_required',
      message: `You have used your ${DEFAULT_ANON_LIMIT} free messages. Browse known issues or return when the free limit resets.`,
      remaining: 0,
      limit: DEFAULT_ANON_LIMIT,
      reset: dayLimit.reset,
      gated: true,
      ctaUrl: '/known-issues',
      ctaLabel: 'Browse known issues',
    }, { status: 429 });
  }
  let dayLimitRefunded = false;
  const refundDayLimit = () => {
    if (dayLimitRefunded) return;
    dayLimitRefunded = true;
    dayLimiter.refund(ip);
  };

  // ── 3a. Server-side WEEKLY quota (backstop for the client-side
  // useAnonymousLimit hook). IP-based daily limits above protect against
  // bots; this quota protects against single-user abuse via localStorage
  // tampering. Subscribers bypass entirely; authed-free users use the
  // grandfather-aware limit (existing users keep 25/week for 90 days,
  // new signups start on 5/week per the pricing brief).
  const isSubscriber = session?.user?.subscriptionStatus === 'active';
  let consumedQuotaKey: string | null = null;
  if (!isSubscriber) {
    // For authed users, fetch createdAt to apply grandfather logic.
    // Cheap lookup; one row by indexed PK. Anonymous path skips this.
    let userCreatedAt: Date | null = null;
    if (isAuthed && userId) {
      try {
        const u = await prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } });
        userCreatedAt = u?.createdAt ?? null;
      } catch { /* silent — falls through to new-user limit */ }
    }
    const quotaKey = isAuthed ? `user:${userId}` : `anon:${await getOrSetAnonId()}`;
    const quotaLimit = isAuthed ? getEffectiveFreeAuthedLimit(userCreatedAt) : DEFAULT_ANON_LIMIT;
    const quota = await checkAndConsumeChatQuota({ key: quotaKey, limit: quotaLimit });
    if (!quota.allowed) {
      refundDayLimit();
      if (isAuthed) {
        // Authed-free at weekly cap — brief's value-anchor pitch.
        return NextResponse.json({
          error: 'quota_exceeded',
          message: `You've hit this week's free limit (${quotaLimit} chats). The next wrong part or shop diagnostic costs more than a whole year of Au7o.`,
          resetAt: quota.resetAt.toISOString(),
          remaining: 0,
          limit: quotaLimit,
          gated: true,
          ctaUrl: '/account',
          ctaLabel: 'Go unlimited — from $14.99/mo',
          secondaryCtaUrl: undefined,
          secondaryCtaLabel: undefined,
        }, { status: 429 });
      }
      // Anon hitting the cookie-based weekly cap (rare — usually
      // the IP daily cap fires first). Same signup pitch as daily.
      return NextResponse.json({
        error: 'login_required',
        message: `You have used your ${DEFAULT_ANON_LIMIT} free messages. Browse known issues or return when the free limit resets.`,
        resetAt: quota.resetAt.toISOString(),
        remaining: 0,
        limit: quotaLimit,
        gated: true,
        ctaUrl: '/known-issues',
        ctaLabel: 'Browse known issues',
      }, { status: 429 });
    }
    consumedQuotaKey = quotaKey;
  }

  // ── 4. Resolve which Vehicle row this corresponds to (authed only) ──
  let vehicleId: string | null = null;
  if (isAuthed) {
    try {
      const found = await prisma.vehicle.findFirst({
        where: {
          userId: userId!,
          year: v.year,
          make: { equals: v.make, mode: 'insensitive' },
          model: { equals: v.model, mode: 'insensitive' },
        },
        select: { id: true },
      });
      vehicleId = found?.id ?? null;
    } catch { /* silent — chat works without a Vehicle row */ }
  }
  // Anonymous users get a synthetic id from the IP+UA hash so we can
  // tie multi-turn anonymous conversations together without inventing
  // accounts. Stable enough for trending; not stable across IP changes.
  const anonymousId = isAuthed ? null : `ip-${ip}`;

  // ── 5. Persist this turn's user message into ChatSession ─────────
  // Whole conversation is stored as a JSON array so every reply can read
  // history without deserializing N rows. ChatPromptInsight is the
  // separate analytical log.
  let sessionId = body.sessionId || null;
  let sessionMessages: HubMessage[] = messages.slice(-MAX_HISTORY_MESSAGES);
  try {
    if (sessionId) {
      // Ownership-scoped lookup — a bare findUnique let any caller continue
      // (read + write into) any user's session by supplying its id, and the
      // victim's stored history was sent to the model and streamed back
      // (2026-06-12 review finding: IDOR). On no match we silently start a
      // fresh session instead of continuing the foreign one — same behavior
      // the GET session route already enforces.
      const existing = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          ...(userId ? { userId } : { userId: null, anonymousId }),
        },
      });
      if (existing) {
        const prevMessages = (existing.messages as unknown as HubMessage[]) || [];
        sessionMessages = [...prevMessages, messages[messages.length - 1]].slice(-MAX_HISTORY_MESSAGES);
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { messages: sessionMessages as unknown as object },
        });
      } else {
        sessionId = null; // not yours (or gone) → new session below
      }
    }
    if (!sessionId) {
      const created = await prisma.chatSession.create({
        data: {
          userId,
          vehicleId,
          messages: sessionMessages as unknown as object,
          anonymousId,
        },
        select: { id: true },
      });
      sessionId = created.id;
    }
  } catch (err) {
    console.warn('[hub-chat] session persist failed (chat continues):', err);
  }

  // Log to insight table (fire-and-forget, never blocks the reply).
  logPromptInsight({
    vehicle: v,
    prompt: userMessage,
    vehicleId,
    userId,
    anonymousId,
  });

  // ── 6. Build the OpenAI request ──────────────────────────────────
  // Previously had two explicit Anthropic cache breakpoints (static
  // system + per-vehicle block). OpenAI does automatic prompt caching
  // for any system prompt >1024 tokens, so combining them into one
  // long system message still gets cache hits — just managed by
  // OpenAI's cache rather than declared by us.
  const knownIssueTitles = Array.isArray(body.knownIssueTitles) ? body.knownIssueTitles.slice(0, 12) : [];
  // If this vehicle isn't in the spec DB, web-search its factory fluid specs
  // (cache-first, bounded) so the chat still grounds instead of guessing.
  let webSpecRows: string[] | undefined;
  try {
    const hasDbSpecs = !!getVehicleSpecs({ year: v.year, make: v.make, model: v.model, trim: v.trim || '' });
    if (!hasDbSpecs) {
      const ws = await getWebSpecs(v);
      webSpecRows = ws?.rows;
    }
  } catch { /* grounding is best-effort */ }
  const vehicleBlock = buildVehicleBlock(v, knownIssueTitles, webSpecRows);

  // ── Location grounding for trip suggestions ───────────────────
  // Reverse-geocode the user's GPS into a city/country string so the
  // assistant can anchor regional suggestions ("Schwarzwald" in Germany,
  // "Pacific Coast Highway" in California). Optional — when GPS isn't
  // available, the trip planner just stays generic. Cheap call, fire-
  // and-forget with a 4s timeout so a slow geocode never blocks chat.
  let locationBlock = '';
  if (body.userLocation && typeof body.userLocation.lng === 'number' && typeof body.userLocation.lat === 'number') {
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (mapboxToken) {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${body.userLocation.lng},${body.userLocation.lat}.json?types=place,locality,region,country&limit=1&language=en&access_token=${mapboxToken}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const data = await res.json();
          const placeName = data.features?.[0]?.place_name || '';
          if (placeName) {
            locationBlock = `Driver's current location: ${placeName}. When suggesting destinations for trips, road trips, scenic drives, or "where should I drive" questions, anchor your suggestion to this region. NEVER default to US classics (Pacific Coast Highway, Blue Ridge Parkway, Route 66) unless the driver is actually in the US. Pick a destination a local would suggest. Use km when the driver is in a metric country (most of the world); miles when in the US/UK.`;
          }
        }
      } catch { /* silent — location grounding is optional */ }
    }
  }
  // The XML wrapper is only on the LATEST user message. Earlier turns
  // are trusted (already produced by the model or echoed back from the
  // user via our own UI). Wrapping every turn would inflate token cost
  // for ~zero additional security.
  const wrappedMessages = sessionMessages.map((m, idx) => {
    if (idx < sessionMessages.length - 1) return { role: m.role, content: m.content };
    return {
      role: 'user' as const,
      content: `<user_message>\n${m.content}\n</user_message>`,
    };
  });

  // Combine the three system blocks into one. OpenAI auto-caches
  // system prompts >1024 tokens, so the single concatenated prompt
  // still benefits from prompt caching for repeated identical
  // (static + vehicle) combinations.
  const systemContent = [STATIC_SYSTEM_PROMPT, vehicleBlock, locationBlock]
    .filter(Boolean)
    .join('\n\n');

  // Stream via SSE so the UI can render token-by-token. Event shape
  // (session/token/done/error) intentionally matches the previous
  // Anthropic implementation so the client side needs no changes.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      send({ type: 'session', sessionId });

      let assistantText = ''; // CLEANED output (markers already grounded) — what the user + history see
      let usageIn = 0;
      let usageOut = 0;
      let replyCompleted = false;
      let weeklyQuotaRefunded = false;
      const refundFailedTurn = async () => {
        refundDayLimit();
        if (consumedQuotaKey && !weeklyQuotaRefunded) {
          weeklyQuotaRefunded = true;
          await refundChatQuota(consumedQuotaKey);
        }
      };

      // Streaming marker rewriter: buffer the model's raw output, replace each
      // complete [[PART:…]] marker with a grounded link before it reaches the
      // client, and hold back a marker that's split across deltas.
      let rawModel = '';
      let flushedLen = 0;
      // Part names that had no verified deep link yet — warmed in the background
      // (after the response) so the record store fills and the next ask is verified.
      const warmParts = new Set<string>();
      const pump = async (final: boolean) => {
        for (;;) {
          const rest = rawModel.slice(flushedLen);
          const open = rest.indexOf(PART_MARK_OPEN);
          if (open === -1) {
            // Hold back a partial marker OR a partial markdown link at the tail so
            // we never emit half a link the sanitizer can't see whole.
            const hold = final ? 0 : Math.max(partialOpenHold(rest), partialLinkHold(rest));
            const rawEmit = rest.slice(0, rest.length - hold);
            if (rawEmit) {
              flushedLen += rawEmit.length; // advance by RAW length (positions in rawModel)
              const clean = stripModelLinks(rawEmit);
              if (clean) { assistantText += clean; send({ type: 'token', text: clean }); }
            }
            return;
          }
          const before = rest.slice(0, open);
          if (before) {
            flushedLen += before.length;
            const clean = stripModelLinks(before);
            if (clean) { assistantText += clean; send({ type: 'token', text: clean }); }
          }
          const rest2 = rawModel.slice(flushedLen); // now begins with PART_MARK_OPEN
          const close = rest2.indexOf(']]');
          if (close === -1) {
            if (final) flushedLen = rawModel.length; // incomplete marker at EOF — drop it, never leak raw
            return;
          }
          const innerText = rest2.slice(PART_MARK_OPEN.length, close);
          const md = await resolveMarkerToMarkdown(innerText, v, warmParts);
          if (md) { assistantText += md; send({ type: 'token', text: md }); }
          flushedLen += close + 2;
        }
      };

      try {
        const openaiMessages = [
          { role: 'system' as const, content: systemContent },
          ...wrappedMessages,
        ];

        const requestModel = (model: string) => fetch(OPENAI_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: openaiMessages,
            max_completion_tokens: MAX_OUTPUT_TOKENS,
            stream: true,
            // Keep full default reasoning — automotive diagnosis must be
            // accurate (wrong part/cost advice is worse than a slow
            // answer). Latency/no-response is handled on the timeout +
            // client side instead, NOT by lowering reasoning quality.
            // Required for usage to appear in the final stream chunk —
            // without this we'd have no way to log token counts.
            stream_options: { include_usage: true },
          }),
          signal: AbortSignal.timeout(55_000),
        });

        const inspectFailure = async (response: Response, model: string) => {
          const responseBody = await response.text().catch(() => 'unreadable response');
          console.error('[hub-chat] model request failed', {
            model,
            status: response.status,
            response: responseBody.slice(0, 500),
          });
          return responseBody;
        };

        const transportResult = await requestHubModelWithTransportFallback(
          HUB_MODELS,
          requestModel,
          (primaryModel, fallbackModel) => {
            console.warn('[hub-chat] primary model request threw; retrying fallback', {
              primaryModel,
              fallbackModel,
            });
          },
        );
        let activeModel = transportResult.model;
        let res = transportResult.response;

        if (!res.ok || !res.body) {
          const responseBody = await inspectFailure(res, activeModel);
          const fallback = HUB_MODELS.fallback;

          if (fallback && fallback !== activeModel && shouldRetryHubModel(res.status, responseBody)) {
            console.warn('[hub-chat] retrying with fallback model', {
              primaryModel: activeModel,
              fallbackModel: fallback,
              status: res.status,
            });
            activeModel = fallback;
            res = await requestModel(activeModel);

            if (!res.ok || !res.body) {
              await inspectFailure(res, activeModel);
              throw new Error('Hub model request failed.');
            }
          } else {
            throw new Error('Hub model request failed.');
          }
        }

        // OpenAI SSE format:
        //   data: {"choices":[{"delta":{"content":"hello"}}]}\n\n
        //   ...
        //   data: {"choices":[{"finish_reason":"stop","delta":{}}],"usage":{...}}\n\n
        //   data: [DONE]\n\n
        const responseStream = res.body;
        if (!responseStream) throw new Error('Hub model response was empty.');
        const reader = responseStream.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx;
          while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const rawEvent = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 2);
            if (!rawEvent.startsWith('data:')) continue;
            const payload = rawEvent.slice(5).trim();
            if (payload === '[DONE]') {
              replyCompleted = true;
              continue;
            }
            try {
              const parsed = JSON.parse(payload);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (typeof delta === 'string' && delta) {
                rawModel += delta;
                await pump(false);
              }
              if (parsed.usage) {
                usageIn = parsed.usage.prompt_tokens || 0;
                usageOut = parsed.usage.completion_tokens || 0;
              }
              if (parsed.choices?.[0]?.finish_reason) replyCompleted = true;
            } catch { /* skip malformed chunk — usually a keep-alive */ }
          }
        }
        // Flush any held-back tail (final marker / partial-open guard).
        await pump(true);

        // Background: web-search-verify any parts we couldn't deep-link yet, so
        // the record store fills and the NEXT ask returns a verified deep link
        // (same source as the known-issues fix links). Runs after the response.
        if (warmParts.size && v?.make && v?.model) {
          const toWarm = [...warmParts].slice(0, 6);
          after(() => Promise.allSettled(toWarm.map((n) => warmVerifiedPart(v, n))));
        }

        // Persist the assistant reply back to the session so next turn's
        // history includes it.
        if (sessionId && assistantText) {
          try {
            const updated = [...sessionMessages, { role: 'assistant' as const, content: assistantText }].slice(-MAX_HISTORY_MESSAGES);
            await prisma.chatSession.update({
              where: { id: sessionId },
              data: { messages: updated as unknown as object },
            });
          } catch (err) {
            console.warn('[hub-chat] reply persist failed:', err);
          }
        }

        // A "successful" stream that produced zero content (reasoning ate
        // the whole token budget, or upstream sent nothing) must not eat
        // the user's credit or leave a silent empty bubble.
        if (!isUsableHubReply(assistantText, replyCompleted)) {
          await refundFailedTurn();
          send({
            type: 'error',
            message: safeHubChatErrorMessage(Boolean(assistantText.trim())),
          });
        } else {
          send({ type: 'done', usage: { in: usageIn, out: usageOut } });
        }
      } catch (err) {
        console.error('[hub-chat] stream error:', err);
        // An interrupted or missing reply never consumes either allowance.
        await refundFailedTurn();
        // A partial reply WAS delivered: persist it so the session history
        // matches what the user sees on screen — previously the client
        // kept the partial while the server dropped it, and the next turn's
        // context silently diverged (2026-06-11 review finding).
        if (sessionId && assistantText) {
          try {
            const updated = [...sessionMessages, { role: 'assistant' as const, content: assistantText }].slice(-MAX_HISTORY_MESSAGES);
            await prisma.chatSession.update({
              where: { id: sessionId },
              data: { messages: updated as unknown as object },
            });
          } catch { /* best effort */ }
        }
        send({
          type: 'error',
          message: safeHubChatErrorMessage(Boolean(assistantText)),
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
