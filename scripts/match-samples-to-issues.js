#!/usr/bin/env node
/* eslint-disable */
/**
 * Phase 0.2 — match consented DiagnosisSamples against the published
 * KnownIssue corpus, OFFLINE (batch script, zero runtime vector math,
 * no pgvector — same design rationale as compute-issue-embeddings.js).
 *
 * What it does:
 *   1. Loads DiagnosisSamples that haven't been matched yet
 *      (matchedIssueIds = []), builds a text from each sample's
 *      scrubbed diagnosis (summary + diagnosed part + YMMT), and embeds
 *      them (text-embedding-3-small — pennies; samples are short).
 *   2. Loads the persisted issue vectors from IssueEmbedding (written
 *      by compute-issue-embeddings.js — run that first after a research
 *      wave so new issues are matchable).
 *   3. Scores cosine similarity under a structural guardrail:
 *        - same make+model (and year ∈ issue.years when both known):
 *          eligible at sim ≥ 0.50 — the YMMT match already does the
 *          heavy lifting, embedding just ranks the issue list
 *        - same make, different model: sim ≥ 0.72 (platform sharing —
 *          e.g. a Tahoe lifter tick matching the Silverado issue)
 *        - different make: never. The flywheel promise is "your photo
 *          matches a known issue on YOUR vehicle".
 *   4. Writes top-K issue ids to DiagnosisSample.matchedIssueIds.
 *   5. Reports ZERO-MATCH samples where the vision diagnosis was
 *      confident (≥ 0.6) — those are real failures happening to real
 *      users that the encyclopedia doesn't cover yet, i.e. the research
 *      queue for the next known-issues wave. Written to
 *      data/research-candidates.json.
 *
 * Zero-match samples keep matchedIssueIds = [] on purpose: they're
 * re-scored on every run, so once a later research wave publishes the
 *      covering issue they pick up the match automatically.
 *
 * Usage:
 *   node scripts/match-samples-to-issues.js --dry-run    # score, no writes
 *   node scripts/match-samples-to-issues.js              # match new samples
 *   node scripts/match-samples-to-issues.js --all        # re-match everything
 *   node scripts/match-samples-to-issues.js --top-k 5    # matches per sample
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) { console.error('Missing OPENAI_API_KEY'); process.exit(1); }

const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_DIMENSIONS = 1536;
const BATCH_SIZE = 100;
const TOP_K_DEFAULT = 5;
// Thresholds per structural tier — see header. Same-vehicle matches are
// pre-filtered hard by YMMT so the similarity bar is low; cross-model
// (shared-platform) matches lean on the embedding alone so the bar is high.
const MIN_SIM_SAME_VEHICLE = 0.5;
const MIN_SIM_SAME_MAKE = 0.72;
// Vision confidence below this = the diagnosis itself was a guess; a
// zero-match there is noise, not a research signal.
const RESEARCH_MIN_CONFIDENCE = 0.6;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const matchAll = args.includes('--all');
const topK = (() => {
  const i = args.indexOf('--top-k');
  return i >= 0 ? parseInt(args[i + 1], 10) : TOP_K_DEFAULT;
})();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4, idleTimeoutMillis: 30000 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// ── Vector codec — MUST stay in sync with compute-issue-embeddings.js ──
function decodeVec(stored) {
  if (!stored || stored.enc !== 'f32b64' || typeof stored.data !== 'string') return null;
  const buf = Buffer.from(stored.data, 'base64');
  const arr = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
  return Array.from(arr);
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

function buildSampleText(sample) {
  const j = sample.diagnosisJson || {};
  const parts = [];
  const ymmt = [sample.year, sample.make, sample.model, sample.trim].filter(Boolean).join(' ');
  if (ymmt) parts.push(`Vehicle: ${ymmt}`);
  if (sample.primaryPartName) parts.push(`Diagnosed component: ${sample.primaryPartName}`);
  if (j.summary) parts.push(String(j.summary));
  const partNames = Array.isArray(j.parts)
    ? j.parts.map((p) => p && p.name).filter(Boolean).slice(0, 8)
    : [];
  if (partNames.length) parts.push(`Parts involved: ${partNames.join(', ')}`);
  if (sample.dtcCodes && sample.dtcCodes.length) parts.push(`DTC: ${sample.dtcCodes.join(', ')}`);
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

const lc = (s) => (s || '').toLowerCase().trim();

(async () => {
  console.log(`[match] mode: ${dryRun ? 'DRY RUN' : 'WRITE'} · scope: ${matchAll ? 'ALL samples' : 'unmatched only'} · topK=${topK}`);

  // ── 1. Samples to process ────────────────────────────────────────
  const samples = await prisma.diagnosisSample.findMany({
    where: matchAll ? {} : { matchedIssueIds: { isEmpty: true } },
    select: {
      id: true, year: true, make: true, model: true, trim: true,
      primaryPartName: true, dtcCodes: true, confidence: true,
      diagnosisJson: true, createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  if (samples.length === 0) {
    console.log('[match] no samples to process — done.');
    await prisma.$disconnect();
    return;
  }
  console.log(`[match] ${samples.length} sample(s) to score`);

  // ── 2. Issue corpus: published issues that have a stored vector ───
  const issues = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { id: true, make: true, model: true, years: true, title: true, category: true },
  });
  const issueById = new Map(issues.map((iss) => [iss.id, iss]));

  const issueVecs = []; // { id, vec, norm }
  const allIds = issues.map((iss) => iss.id);
  for (let i = 0; i < allIds.length; i += 500) {
    const rows = await prisma.issueEmbedding.findMany({
      where: { issueId: { in: allIds.slice(i, i + 500) }, model: EMBED_MODEL },
      select: { issueId: true, vector: true },
    });
    for (const r of rows) {
      const vec = decodeVec(r.vector);
      if (vec && vec.length === EMBED_DIMENSIONS) issueVecs.push({ id: r.issueId, vec, n: norm(vec) });
    }
  }
  console.log(`[match] loaded ${issueVecs.length}/${issues.length} issue vectors from IssueEmbedding`);
  if (issueVecs.length === 0) {
    console.error('[match] IssueEmbedding is empty — run scripts/compute-issue-embeddings.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }
  if (issueVecs.length < issues.length * 0.9) {
    console.warn(`[match] WARNING: ${issues.length - issueVecs.length} published issues have no vector — re-run compute-issue-embeddings.js to cover recent research.`);
  }

  // Group issue vectors by make for cheap candidate narrowing.
  const byMake = new Map();
  for (const iv of issueVecs) {
    const iss = issueById.get(iv.id);
    if (!iss) continue;
    const key = lc(iss.make);
    if (!byMake.has(key)) byMake.set(key, []);
    byMake.get(key).push(iv);
  }

  // ── 3. Embed samples + score ──────────────────────────────────────
  let totalTokens = 0;
  let matchedCount = 0;
  const researchCandidates = [];
  const updates = [];

  for (let i = 0; i < samples.length; i += BATCH_SIZE) {
    const slice = samples.slice(i, i + BATCH_SIZE);
    const texts = slice.map(buildSampleText);
    const { embeddings: vecs, usage } = await embedBatch(texts);
    totalTokens += usage.total_tokens || usage.prompt_tokens || 0;

    for (let j = 0; j < slice.length; j++) {
      const sample = slice[j];
      const sVec = vecs[j];
      const sNorm = norm(sVec);
      const candidates = byMake.get(lc(sample.make)) || [];

      const scored = [];
      for (const iv of candidates) {
        const iss = issueById.get(iv.id);
        const sameModel = lc(iss.model) === lc(sample.model);
        // Year gate only when both sides know the year.
        if (sameModel && sample.year && iss.years && iss.years.length && !iss.years.includes(sample.year)) continue;
        const minSim = sameModel ? MIN_SIM_SAME_VEHICLE : MIN_SIM_SAME_MAKE;
        const sim = dot(sVec, iv.vec) / (sNorm * iv.n);
        if (sim < minSim) continue;
        scored.push({ id: iv.id, sim, sameModel });
      }
      // Same-vehicle matches always outrank cross-model ones.
      scored.sort((a, b) => (b.sameModel - a.sameModel) || (b.sim - a.sim));
      const top = scored.slice(0, topK);

      if (top.length > 0) {
        matchedCount++;
        updates.push({ id: sample.id, matchedIssueIds: top.map((s) => s.id) });
        if (dryRun || updates.length <= 10) {
          const ymmt = [sample.year, sample.make, sample.model].filter(Boolean).join(' ');
          console.log(`\n  ${ymmt} — "${sample.primaryPartName || 'unknown part'}"`);
          for (const t of top) {
            const iss = issueById.get(t.id);
            console.log(`    ${t.sameModel ? '◆' : '◇'} ${t.sim.toFixed(3)} ${iss.title}`);
          }
        }
      } else if ((sample.confidence ?? 0) >= RESEARCH_MIN_CONFIDENCE) {
        researchCandidates.push({
          sampleId: sample.id,
          year: sample.year, make: sample.make, model: sample.model,
          primaryPartName: sample.primaryPartName,
          confidence: sample.confidence,
          summary: (sample.diagnosisJson && sample.diagnosisJson.summary || '').slice(0, 300),
          createdAt: sample.createdAt,
        });
      }
    }
    console.log(`[match] scored ${Math.min(i + BATCH_SIZE, samples.length)}/${samples.length}`);
  }

  // ── 4. Persist matches ────────────────────────────────────────────
  if (!dryRun) {
    for (const u of updates) {
      await prisma.diagnosisSample.update({
        where: { id: u.id },
        data: { matchedIssueIds: u.matchedIssueIds },
      });
    }
  }

  // ── 5. Research-queue report ─────────────────────────────────────
  if (researchCandidates.length > 0) {
    const outPath = path.join(process.cwd(), 'data', 'research-candidates.json');
    let existing = [];
    try { existing = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
    const seen = new Set(existing.map((c) => c.sampleId));
    const fresh = researchCandidates.filter((c) => !seen.has(c.sampleId));
    if (!dryRun) {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify([...existing, ...fresh], null, 2));
    }
    console.log(`\n[match] RESEARCH CANDIDATES — confident diagnoses with NO covering known issue:`);
    for (const c of researchCandidates) {
      console.log(`  · ${[c.year, c.make, c.model].filter(Boolean).join(' ')} — ${c.primaryPartName || '?'} (conf ${c.confidence})`);
    }
    console.log(`[match] ${fresh.length} new candidate(s) appended to data/research-candidates.json (${existing.length + fresh.length} total)`);
  }

  const cost = (totalTokens / 1e6) * 0.02;
  console.log('\n──────────────────────────────────────────────────');
  console.log(`[match] ${samples.length} samples scored · ${matchedCount} matched · ${researchCandidates.length} research candidates`);
  console.log(`[match] writes: ${dryRun ? 'SKIPPED (dry run)' : updates.length}`);
  console.log(`[match] tokens: ${totalTokens} · cost: $${cost.toFixed(4)}`);

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error('[match] fatal:', e);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});
