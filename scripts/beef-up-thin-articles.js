#!/usr/bin/env node
/**
 * Beef up thin articles by researching and adding more known issues.
 * Uses GPT-5.2 to find real, documented problems for vehicles with few issues.
 *
 * Usage:
 *   node scripts/beef-up-thin-articles.js
 *   node scripts/beef-up-thin-articles.js --dry-run
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';
const DELAY_MS = 5000;
const dryRun = process.argv.includes('--dry-run');

// Skip Ford Transit Connect (already done - 11 issues added)
const THIN_VEHICLES = [
  { make: 'Subaru', model: 'WRX STI' },
  { make: 'GMC', model: 'Sierra 3500HD' },
  { make: 'GMC', model: 'Yukon XL' },
  { make: 'Kia', model: 'K5' },
  { make: 'Ford', model: 'Transit' },
  { make: 'Jeep', model: 'Grand Wagoneer' },
  { make: 'MINI', model: 'GP' },
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getExistingIssues(make, model) {
  const { rows } = await pool.query(
    'SELECT title FROM "KnownIssue" WHERE make = $1 AND model = $2 AND status = $3',
    [make, model, 'published']
  );
  return rows.map(r => r.title);
}

async function researchNewIssues(make, model, existingTitles) {
  const prompt = `Research and document 8 additional real, verified known issues/common problems for the ${make} ${model}.

EXISTING ISSUES (do NOT duplicate these):
${existingTitles.map(t => '- ' + t).join('\n')}

For each NEW issue, provide a JSON object with these fields:
- title: Clear, specific issue name (e.g., "Turbocharger Wastegate Rattle")
- description: 2-3 sentences explaining the issue, what causes it, and what owners experience. Be specific to this vehicle.
- solution: How to fix it. Include specific part names/numbers when known.
- severity: "critical", "high", "medium", or "low"
- category: one of "engine", "transmission", "brakes", "suspension", "electrical", "cooling", "fuel", "exhaust", "body", "interior", "hvac", "drivetrain", "safety", "emissions"
- symptoms: array of 3-5 specific symptoms
- years: array of model years affected (use real year ranges for the ${make} ${model})
- estimatedCostLow: minimum repair cost in dollars (integer)
- estimatedCostHigh: maximum repair cost in dollars (integer)
- typicalMileageLow: mileage when issue typically appears (integer)
- typicalMileageHigh: upper mileage range (integer)
- dtcCodes: array of relevant OBD-II codes (if applicable, otherwise empty array)
- reportCount: estimated number of owner reports (be realistic, 10-500 range for most issues)

IMPORTANT RULES:
- Only include REAL, documented issues — not hypothetical ones
- Use data from NHTSA complaints, TSBs, owner forums, and recall databases
- Be specific to the ${make} ${model} — don't use generic car problems
- Each issue must be distinct and not overlap with existing issues
- Include make/model-specific details (engine codes, part numbers, TSB numbers when known)

Return ONLY a JSON array of issue objects. No markdown, no explanation.`;

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        system: 'You are an automotive research expert. Return ONLY valid JSON arrays, no markdown fences, no prose. Use real data from NHTSA, TSBs, and owner reports. No fabricated issues.',
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(90000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('  API error:', err.error?.message || res.status);
      return null;
    }

    const data = await res.json();
    const content = data.content?.[0]?.text || '';
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const issues = JSON.parse(jsonStr);

    if (!Array.isArray(issues)) return null;
    return issues;
  } catch (err) {
    console.error('  Error:', err.message);
    return null;
  }
}

async function insertIssue(make, model, issue) {
  const id = (make + '-' + model + '-' + issue.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100);

  // Check if already exists
  const { rows } = await pool.query('SELECT id FROM "KnownIssue" WHERE id = $1', [id]);
  if (rows.length > 0) return false;

  await pool.query(
    `INSERT INTO "KnownIssue" (id, make, model, years, trims, engines, category, title, description, solution, severity, confidence, symptoms, "affectedSystems", "dtcCodes", "estimatedCostLow", "estimatedCostHigh", "typicalMileageLow", "typicalMileageHigh", citations, "communityRecommendations", "humanApproved", "reportCount", source, status, "lastReportedByOwners", "reviewedOn", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, NOW(), NOW())`,
    [
      id, make, model,
      issue.years || [],
      [], // trims
      [], // engines
      issue.category || 'engine',
      issue.title,
      issue.description || '',
      issue.solution || '',
      issue.severity || 'medium',
      'medium', // confidence
      issue.symptoms || [],
      [issue.category || 'engine'], // affectedSystems
      issue.dtcCodes || [],
      issue.estimatedCostLow || null,
      issue.estimatedCostHigh || null,
      issue.typicalMileageLow || null,
      issue.typicalMileageHigh || null,
      '[]', // citations — will be backfilled separately
      '[]', // communityRecommendations
      false, // humanApproved
      issue.reportCount || 0,
      'ai-researched',
      'published',
      '', // lastReportedByOwners
      new Date().toISOString().split('T')[0], // reviewedOn
    ]
  );
  return true;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Beef Up Thin Articles');
  console.log('  Vehicles:', THIN_VEHICLES.length);
  console.log('  Model:', MODEL);
  console.log('  Dry run:', dryRun);
  console.log('═══════════════════════════════════════════════════════════\n');

  let totalAdded = 0;

  for (const { make, model } of THIN_VEHICLES) {
    const existing = await getExistingIssues(make, model);
    console.log('\n━━━ ' + make + ' ' + model + ' (' + existing.length + ' existing) ━━━');

    const newIssues = await researchNewIssues(make, model, existing);
    if (!newIssues) {
      console.log('  ✗ Failed to research issues');
      await sleep(DELAY_MS);
      continue;
    }

    console.log('  Found ' + newIssues.length + ' new issues');

    for (const issue of newIssues) {
      if (dryRun) {
        console.log('  + [' + issue.severity + '] ' + issue.title + ' (dry run)');
        totalAdded++;
      } else {
        try {
          const inserted = await insertIssue(make, model, issue);
          if (inserted) {
            console.log('  + [' + issue.severity + '] ' + issue.title);
            totalAdded++;
          } else {
            console.log('  ~ [skip] ' + issue.title + ' (already exists)');
          }
        } catch (err) {
          console.log('  ✗ ' + issue.title + ': ' + err.message);
        }
      }
    }

    await sleep(DELAY_MS);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Done! Added ' + totalAdded + ' new issues across ' + THIN_VEHICLES.length + ' vehicles');
  console.log('═══════════════════════════════════════════════════════════');

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  pool.end();
  process.exit(1);
});
