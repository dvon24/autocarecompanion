#!/usr/bin/env node
/**
 * Backfill missing citations for known issues.
 * Uses GPT-4.1-mini to find real sources (NHTSA, TSBs, forums, Reddit, YouTube).
 *
 * Usage:
 *   node scripts/backfill-citations.js                    # all missing
 *   node scripts/backfill-citations.js --make Ford        # specific make
 *   node scripts/backfill-citations.js --limit 50         # limit count
 *   node scripts/backfill-citations.js --dry-run          # preview without updating
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';
const DELAY_MS = 3000; // 3s between calls to avoid rate limits

const args = process.argv.slice(2);
const makeFilter = args.includes('--make') ? args[args.indexOf('--make') + 1] : null;
const limitCount = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : null;
const dryRun = args.includes('--dry-run');
// --dtc-only restricts the backfill to issues that have DTC codes
// attached (i.e. those that appear on any /known-issues/dtc/[code]
// page). Useful when you want to fix the Sources section on DTC pages
// without spending tokens on issues that only show up on the article.
const dtcOnly = args.includes('--dtc-only');
// --count-only does a fast SELECT COUNT(*) and exits without making
// any API calls. Use this to size the run before committing.
const countOnly = args.includes('--count-only');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findCitations(issue) {
  const vehicleStr = issue.make + ' ' + issue.model;
  const yearRange = issue.years && issue.years.length > 0
    ? issue.years[0] + '-' + issue.years[issue.years.length - 1]
    : '';

  const prompt = `Find 2-4 real, verifiable citations/references for this automotive issue. Return ONLY a JSON array, no other text.

Vehicle: ${yearRange} ${vehicleStr}
Issue: ${issue.title}
Description: ${issue.description.slice(0, 300)}
DTC Codes: ${(issue.dtc_codes || []).join(', ')}

Find real sources from:
- NHTSA complaints or recalls (nhtsa.gov)
- Technical Service Bulletins (TSBs) with real bulletin numbers
- Major automotive forums (specific threads if possible)
- Reddit threads (r/MechanicAdvice, r/cars, brand-specific subs)
- YouTube repair videos from known channels
- CarComplaints.com entries

Return format (JSON array only):
[
  {"url": "https://...", "type": "recall|tsb|nhtsa|owner-report|forum|video", "title": "Description of source"}
]

IMPORTANT: Only include sources you are confident exist. Use real NHTSA URLs like https://www.nhtsa.gov/vehicle/YEAR/MAKE/MODEL. Use real TSB numbers when known. Do NOT make up URLs.`;

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
        max_tokens: 800,
        system: 'You are an automotive research assistant. Return ONLY valid JSON arrays. No markdown, no explanation.',
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('  API error:', err.error?.message || res.status);
      return null;
    }

    const data = await res.json();
    const content = data.content?.[0]?.text || '';

    // Parse JSON from response (handle markdown code blocks)
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const citations = JSON.parse(jsonStr);

    if (!Array.isArray(citations) || citations.length === 0) return null;

    // Validate structure
    const valid = citations.filter(c => c.url && c.title && c.type).slice(0, 5);
    return valid.length > 0 ? valid : null;
  } catch (err) {
    console.error('  Error:', err.message);
    return null;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Au7o Citation Backfill');
  console.log('  Make filter:', makeFilter || 'ALL');
  console.log('  Limit:', limitCount || 'ALL');
  console.log('  Dry run:', dryRun);
  console.log('  Model:', MODEL);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Get issues with empty citations
  let query = `SELECT id, make, model, title, description, years, "dtcCodes" as dtc_codes
               FROM "KnownIssue"
               WHERE (citations::text = '[]' OR citations IS NULL)`;
  const params = [];

  if (dtcOnly) {
    // array_length returns NULL for empty arrays, so we check the
    // dtcCodes array has at least one entry. Issues that show up on
    // /known-issues/dtc/[code] pages all satisfy this.
    query += ` AND array_length("dtcCodes", 1) > 0`;
  }

  if (makeFilter) {
    params.push(makeFilter);
    query += ` AND make ILIKE $${params.length}`;
  }

  query += ' ORDER BY make, model, "reportCount" DESC';

  if (limitCount) {
    params.push(limitCount);
    query += ` LIMIT $${params.length}`;
  }

  const { rows } = await pool.query(query, params);
  console.log(`Found ${rows.length} issues with missing citations${dtcOnly ? ' (DTC-linked only)' : ''}\n`);

  if (countOnly) {
    // Rough cost estimate based on observed token usage per call.
    // Sonnet 4.6 pricing: $3 / 1M input, $15 / 1M output (Mar 2025).
    const estTokensIn = rows.length * 1500;
    const estTokensOut = rows.length * 250;
    const estCost = (estTokensIn / 1_000_000) * 3 + (estTokensOut / 1_000_000) * 15;
    const estMinutes = Math.round((rows.length * (DELAY_MS / 1000 + 5)) / 60);
    console.log(`Estimated cost: $${estCost.toFixed(2)} (${estTokensIn.toLocaleString()} in + ${estTokensOut.toLocaleString()} out)`);
    console.log(`Estimated runtime: ~${estMinutes} minutes`);
    await pool.end();
    return;
  }

  let updated = 0;
  let failed = 0;
  let currentMake = '';

  for (let i = 0; i < rows.length; i++) {
    const issue = rows[i];

    if (issue.make !== currentMake) {
      currentMake = issue.make;
      console.log(`\n━━━ ${currentMake} ━━━`);
    }

    process.stdout.write(`  [${i + 1}/${rows.length}] ${issue.make} ${issue.model}: ${issue.title.slice(0, 50)}... `);

    const citations = await findCitations(issue);

    if (!citations) {
      console.log('✗ no citations found');
      failed++;
      await sleep(DELAY_MS);
      continue;
    }

    if (dryRun) {
      console.log(`✓ ${citations.length} citations (dry run)`);
      citations.forEach(c => console.log(`    - [${c.type}] ${c.title}`));
    } else {
      try {
        await pool.query(
          'UPDATE "KnownIssue" SET citations = $1, "updatedAt" = NOW() WHERE id = $2',
          [JSON.stringify(citations), issue.id]
        );
        console.log(`✓ ${citations.length} citations saved`);
        updated++;
      } catch (err) {
        console.log('✗ DB error:', err.message);
        failed++;
      }
    }

    await sleep(DELAY_MS);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Done! Updated: ${updated}, Failed: ${failed}, Total: ${rows.length}`);
  console.log('═══════════════════════════════════════════════════════════');

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  pool.end();
  process.exit(1);
});
