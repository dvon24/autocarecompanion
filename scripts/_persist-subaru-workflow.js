#!/usr/bin/env node
/**
 * Persist the 18 confirmed Subaru issues from workflow wf_3130fb44-7f7
 * (3-vote adversarial verification, subscription-only WebSearch).
 *
 * EXPLICITLY ZERO AI CALLS — pure Prisma writes. Mirrors what
 * scripts/insert-issue.js does but in a single process so we don't
 * spin up 18 separate Node instances for 18 rows.
 *
 * Workflow output is loaded from the .output file path passed as the
 * first arg, or defaults to the most recent run.
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const OUTPUT_PATH = process.argv[2] || 'C:\\Users\\devon\\AppData\\Local\\Temp\\claude\\C--Users-devon-autocarecompanion\\0a61347a-a8f9-41a4-a609-1866ef72c1c2\\tasks\\w0fegdfj9.output';

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
  const makeSlug = slugify(make);
  const modelSlug = slugify(model);
  // Title slug — strip common noise words to keep ids tight
  const titleSlug = slugify(
    title
      .replace(/\([^)]*\)/g, '') // remove parentheticals (recall numbers, etc.)
      .replace(/\b(and|or|the|a|an|of|in|on|at|for|with)\b/gi, '')
  , 60);
  return `${makeSlug}-${modelSlug}-${titleSlug}`.replace(/-+/g, '-');
}

// Map workflow confidence → enum confidence
function mapConfidence(avg) {
  if (avg >= 0.85) return 'high';
  if (avg >= 0.75) return 'medium';
  return 'low';
}

// Sanitize citation: enforce {type, title, url} shape
function cleanCitation(c) {
  const validTypes = ['forum','nhtsa','tsb','recall','article','manufacturer','reddit'];
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

  const raw = fs.readFileSync(OUTPUT_PATH, 'utf-8');
  const payload = JSON.parse(raw);
  const confirmed = payload?.result?.confirmed || [];

  if (confirmed.length === 0) {
    console.error('No confirmed issues in workflow output.');
    process.exit(2);
  }

  console.log(`Found ${confirmed.length} confirmed issues to persist.\n`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const inserted = [];
  const skipped = [];
  const failed = [];

  for (const issue of confirmed) {
    const id = generateId(issue.make, issue.model, issue.title);

    // Skip if id already exists (idempotent re-runs)
    const existing = await prisma.knownIssue.findUnique({ where: { id }, select: { id: true } });
    if (existing) {
      console.log(`⊘ Skipped (id exists): ${id}`);
      skipped.push(id);
      continue;
    }

    const row = {
      id,
      make: issue.make,
      model: issue.model,
      years: Array.isArray(issue.years) ? issue.years : [],
      trims: Array.isArray(issue.trims) ? issue.trims : [],
      engines: Array.isArray(issue.engines) ? issue.engines : [],
      category: issue.category,
      title: issue.title,
      description: issue.description,
      solution: issue.solution,
      severity: issue.severity,
      confidence: mapConfidence(issue._verdictConfidence || 0.8),
      symptoms: Array.isArray(issue.symptoms) ? issue.symptoms : [],
      affectedSystems: [],
      dtcCodes: (Array.isArray(issue.dtcCodes) ? issue.dtcCodes : []).map((c) => String(c).toUpperCase()),
      estimatedCostLow: typeof issue.estimatedCostLow === 'number' ? issue.estimatedCostLow : null,
      estimatedCostHigh: typeof issue.estimatedCostHigh === 'number' ? issue.estimatedCostHigh : null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: (Array.isArray(issue.citations) ? issue.citations : []).map(cleanCitation),
      communityRecommendations: [],
      reportCount: 0,
      source: 'ai-researched',
      status: 'pending_review',
      humanApproved: false,
    };

    try {
      await prisma.knownIssue.create({ data: row });
      console.log(`✓ Inserted: ${id}`);
      console.log(`  ${issue.severity.padEnd(8)} ${issue.model} (${issue.years.join(',')}) — ${issue.title.slice(0, 70)}`);
      console.log(`  citations:${row.citations.length}  confidence:${row.confidence}  verdict:${(issue._verdictConfidence || 0).toFixed(2)}`);
      inserted.push(id);
    } catch (err) {
      console.error(`✗ FAILED: ${id} — ${err.message}`);
      failed.push({ id, error: err.message });
    }
  }

  console.log('\n━━━ Persistence complete ━━━');
  console.log(`  Inserted: ${inserted.length}`);
  console.log(`  Skipped (already exists): ${skipped.length}`);
  console.log(`  Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log('\nFailures:');
    failed.forEach((f) => console.log(`  - ${f.id}: ${f.error}`));
  }

  console.log('\nIds for promote pass:');
  inserted.forEach((id) => console.log(id));

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});