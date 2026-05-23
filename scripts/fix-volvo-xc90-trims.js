#!/usr/bin/env node
/**
 * Backfill missing Volvo XC90 trims — user's friend flagged T5
 * coverage as incomplete. Sweep found two gaps in 2nd-gen XC90 trims:
 *
 *   1. T5 Inscription missing (2016+) — T5 had only Momentum + R-Design
 *      while T6 had Momentum + Inscription + R-Design. T5 Inscription
 *      was sold across most years.
 *   2. B5 and B6 mild-hybrid trims missing entirely (2020-2026) —
 *      Volvo introduced B-prefix badging for mild-hybrid versions
 *      around 2020 (B5 = mild-hybrid T5, B6 = mild-hybrid T6). These
 *      replaced some T-trims in some markets.
 *
 * Also adds D5 diesel to 1st-gen XC90 (2003-2014) for EU markets.
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const ADDITIONS = [
  // 1st-gen XC90: add D5 diesel for EU coverage
  { start: 2003, end: 2014, trim: 'D5' },
  // 1st-gen XC90: add 4.4 V8 (already may have V8 — script handles dedup)
  { start: 2005, end: 2014, trim: '4.4 V8' },

  // 2nd-gen XC90: T5 Inscription (missing trim)
  { start: 2016, end: 2021, trim: 'T5 Inscription' },

  // 2nd-gen XC90: B5/B6 mild-hybrid trims (introduced 2020 refresh)
  { start: 2020, end: 2026, trim: 'B5 Momentum' },
  { start: 2020, end: 2026, trim: 'B5 R-Design' },
  { start: 2020, end: 2026, trim: 'B5 Inscription' },
  { start: 2020, end: 2026, trim: 'B6 Momentum' },
  { start: 2020, end: 2026, trim: 'B6 R-Design' },
  { start: 2020, end: 2026, trim: 'B6 Inscription' },
];

let added = 0;
const stats = {};

for (const { start, end, trim } of ADDITIONS) {
  stats[trim] = 0;
  for (let year = start; year <= end; year++) {
    const yearStr = String(year);
    if (!ymmt[yearStr]?.Volvo?.XC90) continue; // skip if XC90 not present for this year
    if (!ymmt[yearStr].Volvo.XC90.includes(trim)) {
      ymmt[yearStr].Volvo.XC90.push(trim);
      added++;
      stats[trim]++;
    }
  }
}

// Sort each year's XC90 trims alphabetically for stable diffs
Object.keys(ymmt).forEach(year => {
  if (ymmt[year]?.Volvo?.XC90) {
    ymmt[year].Volvo.XC90.sort();
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Added ${added} trim-year combinations to Volvo XC90`);
console.log('\nBreakdown by trim:');
for (const [t, c] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t.padEnd(18)} +${c} years`);
}
