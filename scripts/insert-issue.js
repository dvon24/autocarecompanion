#!/usr/bin/env node
/**
 * Dumb-pipe known-issue inserter. Takes a JSON object describing a
 * KnownIssue row and inserts it with status='pending_review'.
 *
 * EXPLICITLY ZERO AI CALLS — no ANTHROPIC_API_KEY, no OPENAI_API_KEY,
 * no requests to any AI provider. This script exists specifically so
 * that research done via Claude Code's chat subscription (WebSearch
 * in the chat) can be persisted to the DB without triggering paid
 * API usage. The old pipeline scripts (_research-pending.js,
 * _audit-and-promote.js) bypassed the subscription by hitting
 * api.anthropic.com directly with a customer API key; THIS script
 * does not.
 *
 * Usage:
 *   node scripts/insert-issue.js '<json-string>'
 *
 * Or read from stdin (better for long payloads with quotes):
 *   node scripts/insert-issue.js --stdin < draft.json
 *
 * Required fields in the JSON:
 *   id, make, model, years[], category, title, description, solution,
 *   severity ('critical'|'high'|'medium'|'low')
 *
 * Optional fields:
 *   trims[], engines[], confidence ('high'|'medium'|'low'),
 *   symptoms[], affectedSystems[], dtcCodes[],
 *   estimatedCostLow, estimatedCostHigh,
 *   typicalMileageLow, typicalMileageHigh,
 *   citations[] (each: {type, title, url?}),
 *   communityRecommendations[] (each: {type, content, partBrand?, partNumber?, partName?, affiliateUrl?}),
 *   source (default 'ai-researched'),
 *   reportCount (default 0)
 *
 * Always inserts with status='pending_review' so the audit-then-promote
 * gate stays intact. Call scripts/promote-issue.js after manual or
 * subscription-mode audit to flip to 'published'.
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const REQUIRED = ['id', 'make', 'model', 'years', 'category', 'title', 'description', 'solution', 'severity'];
const VALID_SEVERITY = ['critical', 'high', 'medium', 'low'];
const VALID_CONFIDENCE = ['high', 'medium', 'low'];

function parseInput() {
  const args = process.argv.slice(2);
  if (args.includes('--stdin')) {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  }
  const raw = args[0];
  if (!raw) {
    console.error('Usage:');
    console.error('  node scripts/insert-issue.js \'<json>\'');
    console.error('  node scripts/insert-issue.js --stdin < draft.json');
    process.exit(1);
  }
  return JSON.parse(raw);
}

function validate(issue) {
  for (const f of REQUIRED) {
    if (issue[f] === undefined || issue[f] === null || issue[f] === '') {
      throw new Error(`Missing required field: ${f}`);
    }
  }
  if (!/^[a-z0-9-]+$/.test(issue.id)) {
    throw new Error(`id must be kebab-case slug, got: ${issue.id}`);
  }
  if (!Array.isArray(issue.years) || issue.years.length === 0) {
    throw new Error(`years must be a non-empty array of numbers`);
  }
  for (const y of issue.years) {
    if (typeof y !== 'number' || y < 1900 || y > 2099) {
      throw new Error(`years entries must be 4-digit numbers, got: ${y}`);
    }
  }
  if (!VALID_SEVERITY.includes(issue.severity)) {
    throw new Error(`severity must be one of ${VALID_SEVERITY.join('/')}, got: ${issue.severity}`);
  }
  if (issue.confidence && !VALID_CONFIDENCE.includes(issue.confidence)) {
    throw new Error(`confidence must be one of ${VALID_CONFIDENCE.join('/')}, got: ${issue.confidence}`);
  }
  if (issue.citations && !Array.isArray(issue.citations)) {
    throw new Error(`citations must be an array`);
  }
  if (issue.communityRecommendations && !Array.isArray(issue.communityRecommendations)) {
    throw new Error(`communityRecommendations must be an array`);
  }
  // Citation shape check (every entry needs type+title)
  for (const c of issue.citations || []) {
    if (!c.type || !c.title) {
      throw new Error(`each citation needs type+title, got: ${JSON.stringify(c)}`);
    }
  }
}

async function main() {
  const draft = parseInput();
  validate(draft);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Check for existing id collision
  const existing = await prisma.knownIssue.findUnique({ where: { id: draft.id }, select: { id: true, status: true } });
  if (existing) {
    console.error(`✗ Issue with id "${draft.id}" already exists (status=${existing.status}). Refusing to overwrite. Pick a different id or delete the existing row first.`);
    await prisma.$disconnect();
    await pool.end();
    process.exit(2);
  }

  const row = {
    id: draft.id,
    make: draft.make,
    model: draft.model,
    years: draft.years,
    trims: draft.trims || [],
    engines: draft.engines || [],
    category: draft.category,
    title: draft.title,
    description: draft.description,
    solution: draft.solution,
    severity: draft.severity,
    confidence: draft.confidence || 'medium',
    symptoms: draft.symptoms || [],
    affectedSystems: draft.affectedSystems || [],
    dtcCodes: (draft.dtcCodes || []).map((c) => String(c).toUpperCase()),
    estimatedCostLow: draft.estimatedCostLow ?? null,
    estimatedCostHigh: draft.estimatedCostHigh ?? null,
    typicalMileageLow: draft.typicalMileageLow ?? null,
    typicalMileageHigh: draft.typicalMileageHigh ?? null,
    citations: draft.citations || [],
    communityRecommendations: draft.communityRecommendations || [],
    reportCount: draft.reportCount ?? 0,
    source: draft.source || 'ai-researched',
    // Always pending_review — promotion to 'published' is a separate
    // explicit step via scripts/promote-issue.js after audit.
    status: 'pending_review',
    humanApproved: false,
  };

  await prisma.knownIssue.create({ data: row });

  console.log(`✓ Inserted as pending_review: ${draft.id}`);
  console.log(`  ${draft.make} ${draft.model} (${(draft.years || []).join(', ')}) — ${draft.severity}`);
  console.log(`  citations:${(draft.citations || []).length} recs:${(draft.communityRecommendations || []).length} dtcs:${(draft.dtcCodes || []).length}`);
  console.log(`\n  Audit it with WebFetch (subscription, no API spend), then:`);
  console.log(`  node scripts/promote-issue.js ${draft.id}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
