#!/usr/bin/env node
/* eslint-disable */
/**
 * Run the new known-issues research pipeline against a target vehicle and
 * compare the output side-by-side with the existing curated KnownIssue
 * records in Postgres. Pure A/B test — no DB writes — so we can judge
 * pipeline quality before trusting it at scale.
 *
 * Usage:
 *   node scripts/known-issues-pipeline-compare.js --year 2019 --make BMW --model M3
 *   node scripts/known-issues-pipeline-compare.js --year 2019 --make Chevrolet --model Camaro --json   # raw JSON
 *
 * Cost: one Sonnet 4.6 call w/ web_search (~$0.20/vehicle).
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const path = require('path');
const { pathToFileURL } = require('url');

// We import the TS pipeline directly via tsx (already in devDependencies).
// Windows ESM requires file:// URL form for absolute paths, so we convert
// before passing to dynamic import — otherwise we get ERR_UNSUPPORTED_ESM_URL_SCHEME.
async function loadPipeline() {
  const tsPath = path.join(__dirname, '..', 'src', 'lib', 'known-issues-pipeline.ts');
  const tsUrl = pathToFileURL(tsPath).href;
  const mod = await import(tsUrl);
  // Different bundlers/loaders place the named export differently — check
  // both top-level and default-wrapped (CJS interop) before failing loudly.
  const fn = mod.runKnownIssuesPipeline || mod.default?.runKnownIssuesPipeline;
  if (typeof fn !== 'function') {
    console.error('[loadPipeline] unable to find runKnownIssuesPipeline. Module keys:', Object.keys(mod));
    throw new Error('pipeline export not found');
  }
  return { runKnownIssuesPipeline: fn };
}

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : null;
}
const year = parseInt(getArg('year') || '0', 10);
const make = getArg('make');
const model = getArg('model');
const asJson = args.includes('--json');

if (!year || !make || !model) {
  console.error('Usage: node scripts/known-issues-pipeline-compare.js --year YYYY --make MAKE --model MODEL [--json]');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2, idleTimeoutMillis: 30000 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function pad(s, n) { return String(s).slice(0, n).padEnd(n); }

function printIssueShort(label, idx, issue) {
  const sev = (issue.severity || 'med').padEnd(8);
  const cat = (issue.category || 'other').padEnd(12);
  const title = (issue.title || '').slice(0, 70);
  console.log(`  ${label}${idx + 1}. [${sev}] [${cat}] ${title}`);
}

function jaccardWordOverlap(a, b) {
  const ws = (s) => new Set((s || '').toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  const A = ws(a);
  const B = ws(b);
  if (A.size === 0 || B.size === 0) return 0;
  let intersect = 0;
  for (const w of A) if (B.has(w)) intersect++;
  return intersect / (A.size + B.size - intersect);
}

(async () => {
  console.log(`\n[compare] ${year} ${make} ${model}`);
  console.log('═'.repeat(80));

  // 1. Run the pipeline.
  const t0 = Date.now();
  const { runKnownIssuesPipeline } = await loadPipeline();
  let pipelineResult;
  try {
    pipelineResult = await runKnownIssuesPipeline(year, make, model);
  } catch (err) {
    console.error('[pipeline] error:', err.message || err);
    await prisma.$disconnect();
    process.exit(1);
  }
  const ms = Date.now() - t0;

  // 2. Load existing curated issues.
  const existing = await prisma.knownIssue.findMany({
    where: {
      make: { equals: make, mode: 'insensitive' },
      model: { equals: model, mode: 'insensitive' },
      years: { has: year },
      status: 'published',
    },
    orderBy: { severity: 'asc' },
  });

  if (asJson) {
    console.log(JSON.stringify({ pipeline: pipelineResult, existing }, null, 2));
    await prisma.$disconnect();
    return;
  }

  console.log(`\nPipeline: ${pipelineResult.issues.length} issues · ${pipelineResult.webSearchesUsed} web searches · ${ms}ms · tokens in/out: ${pipelineResult.rawResponseTokens.input}/${pipelineResult.rawResponseTokens.output}`);
  console.log(`Existing: ${existing.length} curated issues in DB\n`);

  console.log('─── PIPELINE OUTPUT ───────────────────────────────────────────────────');
  pipelineResult.issues.forEach((i, idx) => {
    printIssueShort('P', idx, i);
    if (i.citations.length > 0) {
      console.log(`        ↳ ${i.citations.length} citation${i.citations.length === 1 ? '' : 's'}: ${i.citations.slice(0, 3).map((c) => c.url.replace(/^https?:\/\//, '').split('/')[0]).join(', ')}`);
    }
  });

  console.log('\n─── EXISTING (CURATED, IN DB) ─────────────────────────────────────────');
  existing.forEach((i, idx) => {
    printIssueShort('E', idx, i);
  });

  // 3. Topical overlap matrix — does the pipeline rediscover the existing issues?
  console.log('\n─── TOPICAL OVERLAP (Jaccard on title+description words) ─────────────');
  const matched = new Set();
  for (let p = 0; p < pipelineResult.issues.length; p++) {
    const pIssue = pipelineResult.issues[p];
    const pText = `${pIssue.title} ${pIssue.description}`;
    let bestE = -1, bestScore = 0;
    for (let e = 0; e < existing.length; e++) {
      const eIssue = existing[e];
      const eText = `${eIssue.title} ${eIssue.description}`;
      const s = jaccardWordOverlap(pText, eText);
      if (s > bestScore) { bestScore = s; bestE = e; }
    }
    if (bestScore >= 0.15) {
      matched.add(bestE);
      console.log(`  P${p + 1} ↔ E${bestE + 1}  (overlap ${(bestScore * 100).toFixed(0)}%) — ${pIssue.title.slice(0, 50)}`);
    } else {
      console.log(`  P${p + 1} (no good match)  — ${pIssue.title.slice(0, 50)}`);
    }
  }

  const unmatched = existing
    .map((_, idx) => idx)
    .filter((i) => !matched.has(i));
  if (unmatched.length > 0) {
    console.log('\n  Existing issues the pipeline DID NOT rediscover:');
    unmatched.forEach((idx) => {
      console.log(`    E${idx + 1}: ${existing[idx].title.slice(0, 70)}`);
    });
  }

  // 4. Citation source health
  console.log('\n─── PIPELINE CITATION DOMAINS ─────────────────────────────────────────');
  const domainCounts = {};
  for (const i of pipelineResult.issues) {
    for (const c of i.citations) {
      const dom = c.url.replace(/^https?:\/\//, '').split('/')[0];
      domainCounts[dom] = (domainCounts[dom] || 0) + 1;
    }
  }
  const sorted = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([dom, n]) => console.log(`  ${dom.padEnd(40)} ${n}`));

  console.log('\n═'.repeat(80));
  console.log('Verdict prompts:');
  console.log('  - Are pipeline issues real? (spot-check the citations)');
  console.log('  - Did it rediscover most of the curated issues?');
  console.log('  - Did it surface new ones the curated set missed?');
  console.log('  - Are citation domains credible (forums you trust, not random sites)?');
  console.log('');

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});
