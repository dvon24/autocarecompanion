#!/usr/bin/env node
/* eslint-disable */
/**
 * Embed every KnownIssue, compute top-K semantic neighbors, persist
 * them as `KnownIssue.relatedIssueIds` so cross-link rendering works
 * via a simple SQL fetch with no runtime vector math.
 *
 * Why pre-compute (offline) instead of runtime vector search?
 *   - We don't have pgvector enabled and don't want to require a Postgres
 *     extension upgrade for what's basically a SEO feature.
 *   - With ~4,300 issues, the full pairwise N×N similarity is 18M
 *     comparisons — trivial in JS (~few seconds), trivial in spend
 *     (one OpenAI embedding call per issue + free local cosine math).
 *   - Result is a static `String[]` column queryable via standard Prisma
 *     `where: { id: { in: [...] } }`, plays nicely with the existing
 *     findRelatedVehiclesForIssues batched query.
 *
 * Sarah's noise guardrail (from party-mode synthesis):
 *   - Pure cosine similarity surfaces "harsh shifting Avenger" matching
 *     "harsh shifting Civic CVT" because the words overlap. They're
 *     unrelated mechanically.
 *   - Filter: a semantic match is kept only when the candidate ALSO
 *     shares at least one of: dtcCode, engine, affectedSystem, OR
 *     category. This pre-filter makes embeddings the second signal,
 *     not the only signal.
 *
 * Usage:
 *   node scripts/compute-issue-embeddings.js --dry-run           # no DB writes
 *   node scripts/compute-issue-embeddings.js                     # full run
 *   node scripts/compute-issue-embeddings.js --limit 200         # subset
 *   node scripts/compute-issue-embeddings.js --top-k 8           # neighbors per issue
 *
 * Cost: ~$0.50 for the full corpus (4,300 issues × ~250 tokens each
 *       at $0.02/M for text-embedding-3-small).
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) { console.error('Missing OPENAI_API_KEY'); process.exit(1); }

const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_DIMENSIONS = 1536;
const BATCH_SIZE = 100; // OpenAI accepts up to 2048 inputs per call
const TOP_K_DEFAULT = 5;
const MIN_SIMILARITY = 0.55; // cosine — below this, candidates are noise
const REQUIRE_STRUCTURAL_OVERLAP = true; // Sarah's guardrail

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const topK = (() => {
  const i = args.indexOf('--top-k');
  return i >= 0 ? parseInt(args[i + 1], 10) : TOP_K_DEFAULT;
})();
const limit = (() => {
  const i = args.indexOf('--limit');
  return i >= 0 ? parseInt(args[i + 1], 10) : null;
})();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4, idleTimeoutMillis: 30000 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function buildEmbeddingText(issue) {
  // Concatenate the signal-bearing fields. Title + description carry the
  // root-cause language; engines + systems give the model a hint about
  // the affected component family.
  const parts = [
    issue.title,
    issue.description || '',
  ];
  if (issue.engines && issue.engines.length > 0) parts.push(`Engine: ${issue.engines.join(', ')}`);
  if (issue.affectedSystems && issue.affectedSystems.length > 0) parts.push(`Systems: ${issue.affectedSystems.join(', ')}`);
  return parts.join('\n').slice(0, 4000);
}

async function embedBatch(texts) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`OpenAI embeddings HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  if (!Array.isArray(data.data)) throw new Error('Embeddings response missing data array');
  return {
    embeddings: data.data.map((d) => d.embedding),
    usage: data.usage || { prompt_tokens: 0, total_tokens: 0 },
  };
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
function norm(a) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * a[i];
  return Math.sqrt(s);
}
function cosine(a, b, na, nb) {
  return dot(a, b) / (na * nb);
}

function structuralOverlap(a, b) {
  // Two issues share structure if any of these are true:
  //   - any DTC in common
  //   - any engine in common (case-insensitive)
  //   - any affectedSystem in common (case-insensitive)
  //   - same category
  if (a.dtcCodes.length && b.dtcCodes.length) {
    const aSet = new Set(a.dtcCodes.map((d) => d.toUpperCase()));
    if (b.dtcCodes.some((d) => aSet.has(d.toUpperCase()))) return true;
  }
  if (a.engines.length && b.engines.length) {
    const aSet = new Set(a.engines.map((e) => e.toLowerCase()));
    if (b.engines.some((e) => aSet.has(e.toLowerCase()))) return true;
  }
  if (a.affectedSystems.length && b.affectedSystems.length) {
    const aSet = new Set(a.affectedSystems.map((s) => s.toLowerCase()));
    if (b.affectedSystems.some((s) => aSet.has(s.toLowerCase()))) return true;
  }
  if (a.category && b.category && a.category === b.category) return true;
  return false;
}

(async () => {
  console.log(`[embed] mode: ${dryRun ? 'DRY RUN' : 'WRITE'} · topK=${topK} · minSim=${MIN_SIMILARITY} · guardrail=${REQUIRE_STRUCTURAL_OVERLAP}`);

  const t0 = Date.now();
  const issues = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: {
      id: true,
      make: true,
      model: true,
      title: true,
      description: true,
      category: true,
      dtcCodes: true,
      engines: true,
      affectedSystems: true,
    },
    take: limit || undefined,
  });
  console.log(`[embed] loaded ${issues.length} published issues from DB (${Date.now() - t0}ms)`);

  // ── Embed in batches ───────────────────────────────────────────────
  const embeddings = [];
  let totalTokens = 0;
  for (let i = 0; i < issues.length; i += BATCH_SIZE) {
    const slice = issues.slice(i, i + BATCH_SIZE);
    const texts = slice.map(buildEmbeddingText);
    const { embeddings: vecs, usage } = await embedBatch(texts);
    if (vecs.length !== slice.length) {
      throw new Error(`Embedding count mismatch: got ${vecs.length} for ${slice.length} inputs`);
    }
    for (let j = 0; j < slice.length; j++) {
      embeddings.push({ id: slice[j].id, vec: vecs[j] });
    }
    totalTokens += usage.total_tokens || usage.prompt_tokens || 0;
    const cost = (totalTokens / 1e6) * 0.02;
    console.log(`[embed] ${i + slice.length}/${issues.length} · tokens=${totalTokens} · cost=$${cost.toFixed(3)}`);
  }

  // ── Pre-compute norms once ──────────────────────────────────────────
  const norms = embeddings.map((e) => norm(e.vec));
  const issueById = new Map(issues.map((iss) => [iss.id, iss]));

  // ── Find top-K neighbors per issue ─────────────────────────────────
  console.log(`[embed] computing pairwise similarity for ${embeddings.length} issues...`);
  const t1 = Date.now();
  let totalKept = 0;
  let totalRejected = 0;
  const updates = [];

  for (let i = 0; i < embeddings.length; i++) {
    const a = embeddings[i];
    const aIssue = issueById.get(a.id);
    if (!aIssue) continue;

    // Score every other issue
    const scored = [];
    for (let j = 0; j < embeddings.length; j++) {
      if (i === j) continue;
      const b = embeddings[j];
      const bIssue = issueById.get(b.id);
      if (!bIssue) continue;

      // Skip same-vehicle siblings — those already get same-make linking elsewhere
      if (
        aIssue.make.toLowerCase() === bIssue.make.toLowerCase() &&
        aIssue.model.toLowerCase() === bIssue.model.toLowerCase()
      ) continue;

      const sim = cosine(a.vec, b.vec, norms[i], norms[j]);
      if (sim < MIN_SIMILARITY) continue;

      // Sarah's guardrail: require structural overlap before semantic match counts.
      if (REQUIRE_STRUCTURAL_OVERLAP && !structuralOverlap(aIssue, bIssue)) {
        totalRejected++;
        continue;
      }
      scored.push({ id: b.id, sim });
    }

    scored.sort((x, y) => y.sim - x.sim);
    const top = scored.slice(0, topK).map((s) => s.id);
    totalKept += top.length;
    updates.push({ id: a.id, relatedIssueIds: top });
  }
  console.log(`[embed] similarity done in ${Math.round((Date.now() - t1) / 1000)}s · kept=${totalKept} rejected_by_guardrail=${totalRejected}`);

  if (dryRun) {
    console.log(`[embed] DRY RUN — sample of first 5 issues + their semantic neighbors:`);
    for (const u of updates.slice(0, 5)) {
      const a = issueById.get(u.id);
      console.log(`\n  ${a.make} ${a.model} — "${a.title}"`);
      for (const nid of u.relatedIssueIds) {
        const n = issueById.get(nid);
        if (n) console.log(`    ↔ ${n.make} ${n.model} — "${n.title}"`);
      }
    }
    await prisma.$disconnect();
    return;
  }

  // ── Persist ─────────────────────────────────────────────────────────
  console.log(`[embed] writing ${updates.length} relatedIssueIds rows to DB...`);
  const t2 = Date.now();
  let written = 0;
  for (const u of updates) {
    await prisma.knownIssue.update({
      where: { id: u.id },
      data: { relatedIssueIds: u.relatedIssueIds },
    });
    written++;
    if (written % 200 === 0) console.log(`[embed]   ${written}/${updates.length}`);
  }
  console.log(`[embed] persisted in ${Math.round((Date.now() - t2) / 1000)}s`);

  const finalCost = (totalTokens / 1e6) * 0.02;
  console.log('\n──────────────────────────────────────────────────');
  console.log(`[embed] complete · ${embeddings.length} issues embedded · ${written} updated`);
  console.log(`[embed] tokens used: ${totalTokens} · cost: $${finalCost.toFixed(3)}`);
  console.log(`[embed] avg neighbors per issue: ${(totalKept / Math.max(1, updates.length)).toFixed(2)}`);

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error('[embed] fatal:', e);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});
