#!/usr/bin/env node
/**
 * Add Lucid to YMMT — US premium EV maker.
 *
 * Lucid Motors (Saudi PIF-backed) targets Mercedes S-Class / Tesla Model S
 * Plaid territory. Air (sedan, 2021+), Gravity (SUV, 2024+).
 * Lower volume but very high SERP value — wealthy owners with $80k+
 * cars asking detailed reliability questions.
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  Air: {
    2021: { end: 2026, trims: [
      'Pure', 'Pure RWD', 'Pure AWD',
      'Touring',
      'Grand Touring', 'Grand Touring Performance',
      'Sapphire', // 1,234hp tri-motor flagship
      'Dream Edition', 'Dream Edition Performance', 'Dream Edition Range',
    ] },
  },
  Gravity: {
    2024: { end: 2026, trims: [
      'Grand Touring', 'Touring', 'Sapphire',
      'Dream Edition', // launch edition
    ] },
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Lucid) ymmt[yearStr].Lucid = {};
  if (!ymmt[yearStr].Lucid[model]) {
    ymmt[yearStr].Lucid[model] = trims;
    return true;
  }
  return false;
}

let addedCount = 0;
const stats = {};

for (const [model, generations] of Object.entries(MODELS)) {
  stats[model] = 0;
  for (const [startStr, { end, trims }] of Object.entries(generations)) {
    const start = parseInt(startStr, 10);
    for (let year = start; year <= end; year++) {
      if (addModelToYear(year, model, trims)) { addedCount++; stats[model]++; }
    }
  }
}

Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Lucid) {
    const sorted = {};
    Object.keys(ymmt[year].Lucid).sort().forEach(m => { sorted[m] = ymmt[year].Lucid[m]; });
    ymmt[year].Lucid = sorted;
  }
});

Object.keys(ymmt).forEach(year => {
  const sortedMakes = {};
  Object.keys(ymmt[year]).sort().forEach(m => { sortedMakes[m] = ymmt[year][m]; });
  ymmt[year] = sortedMakes;
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Added ${addedCount} Lucid year/model combinations`);
console.log('\nBreakdown by model:');
for (const [m, c] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${m.padEnd(14)} ${c} years`);
}
