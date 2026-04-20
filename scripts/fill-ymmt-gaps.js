#!/usr/bin/env node
/**
 * Audit YMMT data for gap years and fill in real data holes.
 *
 * Strategy:
 *   1. Find every (make, model) where a year is missing but adjacent years exist (a "sandwich gap")
 *   2. Ask GPT-5.2: for each missing year, was this model sold in the US market?
 *   3. If yes, what trims? (seed from adjacent-year trims)
 *   4. Merge real holes back into ymmt.json, leave legit production gaps alone
 *
 * Usage:
 *   node scripts/fill-ymmt-gaps.js --dry-run
 *   node scripts/fill-ymmt-gaps.js --make BMW
 *   node scripts/fill-ymmt-gaps.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';
const DELAY_MS = 1500;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const makeFilter = args.includes('--make') ? args[args.indexOf('--make') + 1] : null;

const YMMT_PATH = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function findGaps(ymmt) {
  const years = Object.keys(ymmt).sort();
  const makes = new Set();
  years.forEach(y => Object.keys(ymmt[y] || {}).forEach(m => makes.add(m)));

  const combos = [];
  for (const make of makes) {
    if (makeFilter && make !== makeFilter) continue;
    const yearsWith = years.filter(y => ymmt[y]?.[make]);
    if (yearsWith.length < 2) continue;

    const modelYears = {};
    yearsWith.forEach(y => {
      Object.keys(ymmt[y][make]).forEach(mdl => {
        (modelYears[mdl] = modelYears[mdl] || new Map()).set(parseInt(y), ymmt[y][make][mdl]);
      });
    });

    for (const mdl in modelYears) {
      const yearMap = modelYears[mdl];
      const ys = [...yearMap.keys()].sort((a, b) => a - b);
      const gaps = [];
      for (let i = 0; i < ys.length - 1; i++) {
        const a = ys[i], b = ys[i + 1];
        if (b - a >= 2) {
          for (let mid = a + 1; mid < b; mid++) gaps.push(mid);
        }
      }
      if (gaps.length) {
        combos.push({ make, model: mdl, gaps, yearMap });
      }
    }
  }
  return combos;
}

async function verifyGaps(combo) {
  const { make, model, gaps, yearMap } = combo;
  const years = [...yearMap.keys()].sort((a, b) => a - b);

  const anchorExamples = [];
  const lowest = years[0];
  const highest = years[years.length - 1];
  const beforeGap = years.filter(y => y < gaps[0]).pop();
  const afterGap = years.filter(y => y > gaps[gaps.length - 1]).shift();
  [lowest, beforeGap, afterGap, highest].filter(Boolean).forEach(y => {
    if (!anchorExamples.find(a => a.year === y)) {
      anchorExamples.push({ year: y, trims: yearMap.get(y) });
    }
  });

  const prompt = `For the ${make} ${model}, determine for each missing year whether it was sold as a NEW vehicle in the US market.

Reference data (years we already have, with trim examples):
${anchorExamples.map(a => `- ${a.year}: ${a.trims.join(', ')}`).join('\n')}

Missing years to verify: ${gaps.join(', ')}

For each missing year, return:
- "sold": true if sold as new in US that model year, false if not (truly discontinued, not yet launched, or skipped model year)
- "trims": array of trim names actually offered that year (use the ADJACENT year trims as a guide, but update if real-world lineup differed). Empty array if sold=false.

IMPORTANT:
- Be accurate — don't hallucinate. Many models have real production gaps (e.g., BMW 8 Series 1998-2018 was discontinued, BMW M3 2007 was between E46 and E92).
- Some models skip specific model years during redesigns (e.g., no 2020 BMW M3 between F80 and G80).
- EVs and new nameplates didn't exist before their launch year.
- Use US market specifically (ignore other regions).

Return ONLY JSON in this exact shape:
{ "results": [ { "year": 2024, "sold": true, "trims": ["trim1", "trim2"] }, ... ] }`;

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      system: 'You are an automotive historian. You know US market vehicle lineups by model year with precision. Return only valid JSON with no markdown fences, no prose. Never fabricate — say sold=false when uncertain or when the model was truly absent from the US market that year.',
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API ${res.status}`);
  }

  const data = await res.json();
  const raw = data.content?.[0]?.text || '{}';
  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(jsonStr);
  return parsed.results || [];
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  YMMT Gap Audit & Fill');
  console.log('  Dry run:', dryRun);
  console.log('  Make filter:', makeFilter || 'ALL');
  console.log('  Model:', MODEL);
  console.log('═══════════════════════════════════════════════════════════\n');

  const ymmt = JSON.parse(fs.readFileSync(YMMT_PATH, 'utf8'));
  const combos = findGaps(ymmt);
  console.log(`Found ${combos.length} make+model combos with gap years\n`);

  const proposedFills = [];
  const realGaps = [];
  let processed = 0;
  let failed = 0;

  for (const combo of combos) {
    processed++;
    process.stdout.write(`  [${processed}/${combos.length}] ${combo.make} ${combo.model} (${combo.gaps.length} missing years)... `);

    try {
      const results = await verifyGaps(combo);
      let filled = 0, legit = 0;
      for (const r of results) {
        if (r.sold && r.trims && r.trims.length > 0) {
          proposedFills.push({ make: combo.make, model: combo.model, year: r.year, trims: r.trims });
          filled++;
        } else {
          realGaps.push({ make: combo.make, model: combo.model, year: r.year });
          legit++;
        }
      }
      console.log(`✓ ${filled} fills, ${legit} real gaps`);
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }
    await sleep(DELAY_MS);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Proposed fills: ${proposedFills.length}`);
  console.log(`  Confirmed real gaps (no fill): ${realGaps.length}`);
  console.log(`  Failed lookups: ${failed}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (proposedFills.length > 0) {
    console.log('━━━ PROPOSED FILLS (sample) ━━━');
    proposedFills.slice(0, 20).forEach(f => {
      console.log(`  + ${f.year} ${f.make} ${f.model}: ${f.trims.join(', ')}`);
    });
    if (proposedFills.length > 20) console.log(`  ... and ${proposedFills.length - 20} more`);
  }

  if (realGaps.length > 0) {
    console.log('\n━━━ CONFIRMED REAL GAPS (sample) ━━━');
    realGaps.slice(0, 20).forEach(g => {
      console.log(`  - ${g.year} ${g.make} ${g.model} (not sold in US)`);
    });
    if (realGaps.length > 20) console.log(`  ... and ${realGaps.length - 20} more`);
  }

  if (dryRun) {
    const previewPath = path.join(__dirname, '_ymmt-gap-fills-preview.json');
    fs.writeFileSync(previewPath, JSON.stringify({ proposedFills, realGaps }, null, 2));
    console.log(`\nDry run — preview saved to: ${previewPath}`);
    return;
  }

  // Apply fills
  for (const f of proposedFills) {
    const yStr = String(f.year);
    ymmt[yStr] = ymmt[yStr] || {};
    ymmt[yStr][f.make] = ymmt[yStr][f.make] || {};
    if (!ymmt[yStr][f.make][f.model]) {
      ymmt[yStr][f.make][f.model] = f.trims;
    }
  }

  // Sort years descending to match file convention (check current ordering first)
  const sortedYmmt = {};
  Object.keys(ymmt).sort().forEach(y => {
    sortedYmmt[y] = {};
    Object.keys(ymmt[y]).sort().forEach(make => {
      sortedYmmt[y][make] = {};
      Object.keys(ymmt[y][make]).sort().forEach(mdl => {
        sortedYmmt[y][make][mdl] = ymmt[y][make][mdl];
      });
    });
  });

  fs.writeFileSync(YMMT_PATH, JSON.stringify(sortedYmmt, null, 2));
  console.log(`\nApplied ${proposedFills.length} fills to ${YMMT_PATH}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
