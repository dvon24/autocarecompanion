#!/usr/bin/env node
/**
 * Persist a known-issues research workflow's output:
 *   - confirmed[]  -> KnownIssue rows with status 'pending_review'
 *                    (NOT published — a human promote pass publishes them)
 *   - visualEvidence[] -> data/visual-evidence-held.json (HELD test data for
 *                    the visual flywheel; NEVER written to the DB / published)
 *
 * EXPLICITLY ZERO AI CALLS — pure Prisma writes + one local JSON file.
 * Idempotent: skips KnownIssue ids that already exist, dedupes visual
 * evidence by url.
 *
 * Usage:  node scripts/_persist-known-issues-run.js <workflow-output-path>
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const OUTPUT_PATH = args.find((arg) => !arg.startsWith('--'));
if (!OUTPUT_PATH) {
  console.error('Usage: node scripts/_persist-known-issues-run.js <workflow-output-path>');
  process.exit(1);
}

const HELD_VISUAL_PATH = path.join(__dirname, '..', 'data', 'visual-evidence-held.json');

// The UI's categoryConfig knows exactly these 17 categories; anything else
// crashes/garbles the article pages (2026-06-11 incident). Research workflows
// historically used a wider list — normalize HERE so bad values never land.
const UI_CATEGORIES = ['engine', 'transmission', 'drivetrain', 'electrical', 'brakes', 'suspension', 'cooling', 'fuel', 'interior', 'exterior', 'body', 'safety', 'exhaust', 'steering', 'hvac', 'emissions', 'other'];
const CATEGORY_ALIASES = { 'fuel-system': 'fuel', fuel_system: 'fuel', electronics: 'electrical', ignition: 'engine', 'wheels-tires': 'suspension' };
function toUiCategory(cat) {
  const lower = String(cat || '').toLowerCase();
  if (UI_CATEGORIES.includes(lower)) return lower;
  return CATEGORY_ALIASES[lower] || 'other';
}
// UI severity enum is high/medium/low; 'critical' rows are hidden by the
// article severity filter. Matches src/lib/known-issues.ts normalizeSeverity.
function toUiSeverity(sev) {
  const lower = String(sev || '').toLowerCase();
  if (lower === 'critical' || lower === 'high') return 'high';
  if (lower === 'low') return 'low';
  return 'medium';
}

function slugify(text, maxLen = 80) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen)
    .replace(/-+$/, '');
}

function generateId(make, model, title) {
  const titleSlug = slugify(
    title.replace(/\([^)]*\)/g, '').replace(/\b(and|or|the|a|an|of|in|on|at|for|with)\b/gi, ''),
    60,
  );
  return `${slugify(make)}-${slugify(model)}-${titleSlug}`.replace(/-+/g, '-');
}

function mapConfidence(avg) {
  if (avg >= 0.85) return 'high';
  if (avg >= 0.75) return 'medium';
  return 'low';
}

function cleanCitation(c) {
  const validTypes = ['forum', 'nhtsa', 'tsb', 'recall', 'article', 'manufacturer', 'reddit'];
  return {
    type: validTypes.includes(c.type) ? c.type : 'article',
    title: String(c.title || 'Reference').slice(0, 300),
    url: String(c.url || ''),
  };
}

async function main() {
  if (!fs.existsSync(OUTPUT_PATH)) {
    console.error(`Workflow output not found at: ${OUTPUT_PATH}`);
    process.exit(1);
  }
  const payload = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
  const confirmed = payload?.result?.confirmed || [];
  const visualEvidence = payload?.result?.visualEvidence || [];
  const stats = payload?.result?.stats || {};

  console.log(`Workflow stats: ${JSON.stringify(stats)}`);
  console.log(`Confirmed issues to persist (pending_review): ${confirmed.length}`);
  console.log(`Visual-evidence items to HOLD (not published): ${visualEvidence.length}\n`);

  // ── 1. Hold the visual evidence in a local JSON file (never the DB) ──
  let heldExisting = [];
  if (fs.existsSync(HELD_VISUAL_PATH)) {
    try { heldExisting = JSON.parse(fs.readFileSync(HELD_VISUAL_PATH, 'utf-8')); } catch { heldExisting = []; }
  }
  const seenUrls = new Set(heldExisting.map((v) => v.url));
  let addedVisual = 0;
  for (const v of visualEvidence) {
    if (v && v.url && !seenUrls.has(v.url)) {
      heldExisting.push({ ...v, capturedFrom: path.basename(OUTPUT_PATH) });
      seenUrls.add(v.url);
      addedVisual++;
    }
  }
  if (!DRY_RUN) {
    fs.mkdirSync(path.dirname(HELD_VISUAL_PATH), { recursive: true });
    fs.writeFileSync(HELD_VISUAL_PATH, JSON.stringify(heldExisting, null, 2));
  }
  console.log(`${DRY_RUN ? 'Would hold' : 'Held'} visual evidence: +${addedVisual} new (total ${heldExisting.length})${DRY_RUN ? '' : ` -> ${HELD_VISUAL_PATH}`}\n`);

  // ── 2. Persist confirmed issues to the review queue ──────────────────
  if (confirmed.length === 0) {
    console.log('No confirmed issues to persist. Done.');
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const inserted = [];
  const skipped = [];
  const failed = [];

  for (const issue of confirmed) {
    // Vehicle class. Defaults to 'car' so every existing automotive wave keeps behaving exactly as
    // before; a research workflow opts in by emitting vehicleType on its confirmed rows.
    const vehicleType = issue.vehicleType === 'motorcycle' ? 'motorcycle' : 'car';

    const id = generateId(issue.make, issue.model, issue.title);
    const existing = await prisma.knownIssue.findUnique({ where: { id }, select: { id: true, vehicleType: true } });
    if (existing) {
      // A same-id hit ACROSS vehicle classes is not a duplicate - it is an id collision, and
      // skipping it silently would drop a real issue while looking like ordinary dedupe. Make names
      // are shared across classes (Triumph, Suzuki, BMW, Honda all build both), so this is a live
      // possibility rather than a theoretical one.
      if (existing.vehicleType !== vehicleType) {
        console.error(`! ID COLLISION ACROSS VEHICLE TYPES: ${id} exists as ${existing.vehicleType}, incoming is ${vehicleType} — NOT inserted, needs a manual id`);
        failed.push({ id, error: `id collision: existing ${existing.vehicleType} vs incoming ${vehicleType}` });
        continue;
      }
      skipped.push(id);
      continue;
    }

    const row = {
      id,
      vehicleType,
      make: issue.make,
      model: issue.model,
      years: Array.isArray(issue.years) ? issue.years : [],
      trims: Array.isArray(issue.trims) ? issue.trims : [],
      engines: Array.isArray(issue.engines) ? issue.engines : [],
      category: toUiCategory(issue.category),
      title: issue.title,
      description: issue.description,
      solution: issue.solution,
      severity: toUiSeverity(issue.severity),
      confidence: mapConfidence(issue._verdictConfidence || 0.8),
      symptoms: Array.isArray(issue.symptoms) ? issue.symptoms : [],
      affectedSystems: [],
      dtcCodes: (Array.isArray(issue.dtcCodes) ? issue.dtcCodes : []).map((c) => String(c).toUpperCase()),
      estimatedCostLow: typeof issue.estimatedCostLow === 'number' ? issue.estimatedCostLow : null,
      estimatedCostHigh: typeof issue.estimatedCostHigh === 'number' ? issue.estimatedCostHigh : null,
      citations: (Array.isArray(issue.citations) ? issue.citations : []).map(cleanCitation),
      communityRecommendations: [],
      reportCount: 0,
      source: 'ai-researched',
      status: 'pending_review',
      humanApproved: false,
    };

    if (DRY_RUN) {
      console.log(`+ WOULD INSERT: ${id}  [${issue.severity}] ${vehicleType === 'motorcycle' ? '🏍 ' : ''}${issue.model} (${(issue.years || []).join(',')})`);
      inserted.push(id);
      continue;
    }
    try {
      await prisma.knownIssue.create({ data: row });
      console.log(`✓ ${id}  [${issue.severity}] ${issue.model} (${(issue.years || []).join(',')}) — verdict ${(issue._verdictConfidence || 0).toFixed(2)}, ${row.citations.length} cites`);
      inserted.push(id);
    } catch (err) {
      console.error(`✗ FAILED: ${id} — ${err.message}`);
      failed.push({ id, error: err.message });
    }
  }

  console.log(`\n━━━ ${DRY_RUN ? 'Dry run' : 'Persistence complete'} (status = pending_review) ━━━`);
  console.log(`  ${DRY_RUN ? 'Would insert' : 'Inserted'}: ${inserted.length}`);
  console.log(`  Skipped (already exists): ${skipped.length}`);
  console.log(`  Failed: ${failed.length}`);
  if (failed.length) failed.forEach((f) => console.log(`    - ${f.id}: ${f.error}`));
  console.log('\nReview + promote these to published with scripts/promote-issue.js');

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => { console.error('FAIL:', err.message); process.exit(1); });
