#!/usr/bin/env node
/* eslint-disable */
/**
 * Backfill `dtcCodes` and `engines` on existing KnownIssue rows by reading
 * each issue's title + description with Claude Haiku 4.5. Cheap (~$0.001
 * per issue), narrow prompt (no web_search), runs concurrently.
 *
 * The point: cross-vehicle linking on /known-issues only fires when issues
 * share a DTC OR engine code. Pre-fix coverage was 47% DTC, 24% engines —
 * fewer than half of pages had any cross-link signal. This pass fills in
 * the data so the hub-and-spoke effect kicks in for shared-platform
 * issues (HEMI MDS lifters, B58 timing chains, EA888 tensioners, etc.)
 * even when there's no SAE/OBD-II code attached.
 *
 * Safety:
 *  - Skips humanApproved=true rows (curated content).
 *  - Merges with existing arrays — never overwrites.
 *  - --dry-run shows what would happen without DB writes.
 *
 * Usage:
 *   node scripts/extract-issue-metadata.js --dry-run --limit 10
 *   node scripts/extract-issue-metadata.js              # gap-fill mode (default)
 *   node scripts/extract-issue-metadata.js --refresh-all  # also re-run on issues that already have data
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_KEY) { console.error('Missing ANTHROPIC_API_KEY'); process.exit(1); }

const MODEL = 'claude-haiku-4-5-20251001';
const CONCURRENCY = parseInt(process.env.EXTRACT_CONCURRENCY || '8', 10);

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const refreshAll = args.includes('--refresh-all');
const limit = (() => {
  const i = args.indexOf('--limit');
  return i >= 0 ? parseInt(args[i + 1], 10) : null;
})();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4, idleTimeoutMillis: 30000 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function extractFor(issue) {
  const yearStr = Array.isArray(issue.years) && issue.years.length > 0
    ? `${issue.years[0]}${issue.years.length > 1 ? `-${issue.years[issue.years.length - 1]}` : ''} `
    : '';

  const userPrompt = `Extract metadata from this documented car issue.

Vehicle: ${yearStr}${issue.make} ${issue.model}
Title: ${issue.title}
Description: ${(issue.description || '').slice(0, 700)}

Return ONLY JSON of this exact shape (no other text, no markdown fences):
{ "dtcCodes": ["P0301"], "engines": ["5.7 HEMI"] }

Rules:
- dtcCodes: OBD-II/SAE codes (P0xxx, P1xxx, B0xxx, U0xxx, C0xxx). Include only those EXPLICITLY mentioned in the title/description, OR very directly implied (e.g., a description naming "cylinder 3 misfire" → P0303). Never guess. Empty array is fine.
- engines: canonical engine code/designation as commonly used by enthusiasts. Examples: "5.7 HEMI", "6.4 HEMI", "B58", "S55", "S58", "N20", "N54", "N55", "LT4", "LT1", "LS3", "LSA", "EA888 Gen 3", "EA837", "Pentastar 3.6L", "Coyote 5.0", "Voodoo 5.2", "Predator 5.2", "EcoBoost 3.5", "EcoBoost 2.7", "K20C1", "B-series", "JZ", "RB", "VR38DETT", "M133", "M177", "M139". Use canonical short form. Only include engines explicitly named in the title or description. Empty array if no engine is named.
- Do NOT invent or speculate. Empty arrays are correct when nothing matches.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 256,
      messages: [{ role: 'user', content: userPrompt }],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 100)}`, inputTokens: 0, outputTokens: 0 };
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
  const cleaned = text.replace(/```json|```/g, '').trim();

  let parsed;
  try { parsed = JSON.parse(cleaned); }
  catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) { try { parsed = JSON.parse(match[0]); } catch { /* fall through */ } }
  }
  if (!parsed) {
    return { ok: false, error: 'no JSON', inputTokens: data.usage?.input_tokens || 0, outputTokens: data.usage?.output_tokens || 0 };
  }

  return {
    ok: true,
    dtcCodes: Array.isArray(parsed.dtcCodes)
      ? parsed.dtcCodes.map((s) => String(s).toUpperCase().trim()).filter((s) => /^[A-Z]\d{4}$/.test(s))
      : [],
    engines: Array.isArray(parsed.engines)
      ? parsed.engines.map((s) => String(s).trim()).filter(Boolean)
      : [],
    inputTokens: data.usage?.input_tokens || 0,
    outputTokens: data.usage?.output_tokens || 0,
  };
}

async function runPool(items, worker, concurrency) {
  let idx = 0;
  let done = 0;
  let errored = 0;
  let totalIn = 0;
  let totalOut = 0;
  let dtcAdded = 0;
  let engAdded = 0;
  const startTs = Date.now();
  async function loop() {
    while (idx < items.length) {
      const i = idx++;
      const item = items[i];
      try {
        const r = await worker(item);
        done++;
        if (r.error) errored++;
        if (r.dtcAdded) dtcAdded += r.dtcAdded;
        if (r.engAdded) engAdded += r.engAdded;
        totalIn += r.inputTokens || 0;
        totalOut += r.outputTokens || 0;
      } catch (e) {
        errored++;
        done++;
      }
      if (done % 50 === 0 || done === items.length) {
        const cost = (totalIn / 1e6) * 1 + (totalOut / 1e6) * 5;
        const elapsed = Math.round((Date.now() - startTs) / 1000);
        console.log(`[${done}/${items.length}] errors=${errored} dtcAdded=${dtcAdded} engAdded=${engAdded} elapsed=${elapsed}s cost=$${cost.toFixed(2)}`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, loop));
  return { done, errored, totalIn, totalOut, dtcAdded, engAdded };
}

(async () => {
  let where = { status: 'published', humanApproved: false };
  if (!refreshAll) {
    where = {
      ...where,
      OR: [
        { dtcCodes: { isEmpty: true } },
        { engines: { isEmpty: true } },
      ],
    };
  }

  const issues = await prisma.knownIssue.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      make: true,
      model: true,
      years: true,
      dtcCodes: true,
      engines: true,
    },
    orderBy: { reportCount: 'desc' },
    take: limit || undefined,
  });

  console.log(`[extract] target: ${issues.length} issues`);
  console.log(`[extract] mode: ${refreshAll ? 'refresh-all (skip humanApproved)' : 'gap-fill (only issues with empty dtcCodes OR engines)'}`);
  console.log(`[extract] concurrency=${CONCURRENCY}, dryRun=${dryRun}\n`);

  if (issues.length === 0) {
    console.log('Nothing to do.');
    await prisma.$disconnect();
    return;
  }

  const summary = await runPool(
    issues,
    async (issue) => {
      const r = await extractFor(issue);
      if (!r.ok) {
        return { error: r.error, inputTokens: r.inputTokens, outputTokens: r.outputTokens };
      }
      // Merge with existing — never drop curated entries.
      const existingDtc = new Set((issue.dtcCodes || []).map((s) => s.toUpperCase()));
      const newDtc = r.dtcCodes.filter((d) => !existingDtc.has(d));
      const existingEng = new Set((issue.engines || []).map((s) => s.toLowerCase()));
      const newEng = r.engines.filter((e) => !existingEng.has(e.toLowerCase()));

      if (!dryRun && (newDtc.length > 0 || newEng.length > 0)) {
        await prisma.knownIssue.update({
          where: { id: issue.id },
          data: {
            dtcCodes: [...(issue.dtcCodes || []), ...newDtc],
            engines: [...(issue.engines || []), ...newEng],
          },
        });
      }

      return {
        ok: true,
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        dtcAdded: newDtc.length,
        engAdded: newEng.length,
      };
    },
    CONCURRENCY,
  );

  const cost = (summary.totalIn / 1e6) * 1 + (summary.totalOut / 1e6) * 5;
  console.log('\n──────────────────────────────────────────────────');
  console.log(`[extract] done · ${summary.done} processed · ${summary.errored} errors`);
  console.log(`[extract] DTCs added: ${summary.dtcAdded} · engines added: ${summary.engAdded}`);
  console.log(`[extract] tokens: ${summary.totalIn} in + ${summary.totalOut} out`);
  console.log(`[extract] spend: $${cost.toFixed(2)}`);
  if (dryRun) console.log('[extract] DRY RUN — no DB writes performed.');

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error('[extract] fatal:', e);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});
