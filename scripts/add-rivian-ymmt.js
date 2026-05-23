#!/usr/bin/env node
/**
 * Add Rivian to YMMT — US-based EV truck/SUV startup.
 *
 * R1T (truck) and R1S (SUV) launched 2021-2022. R2 announced for 2026
 * production. R3/R3X concepts announced but no production date.
 * EDV (Electric Delivery Van) — Amazon-only initially.
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  R1T: {
    2021: { end: 2026, trims: [
      'Adventure', 'Adventure Max', 'Explore',
      'Dual-Motor Standard', 'Dual-Motor Large', 'Dual-Motor Max',
      'Quad-Motor', 'Tri-Motor', 'Performance Dual-Motor',
      'Launch Edition', 'Standard Pack', 'Large Pack', 'Max Pack',
    ] },
  },
  R1S: {
    2022: { end: 2026, trims: [
      'Adventure', 'Adventure Max', 'Explore',
      'Dual-Motor Standard', 'Dual-Motor Large', 'Dual-Motor Max',
      'Quad-Motor', 'Tri-Motor', 'Performance Dual-Motor',
      'Launch Edition', 'Standard Pack', 'Large Pack', 'Max Pack',
    ] },
  },
  R2: {
    2026: { end: 2026, trims: ['Single-Motor', 'Dual-Motor', 'Tri-Motor'] }, // production starting
  },
  EDV: {
    2022: { end: 2026, trims: ['EDV 700', 'EDV 500'] }, // Amazon delivery van
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Rivian) ymmt[yearStr].Rivian = {};
  if (!ymmt[yearStr].Rivian[model]) {
    ymmt[yearStr].Rivian[model] = trims;
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
  if (ymmt[year].Rivian) {
    const sorted = {};
    Object.keys(ymmt[year].Rivian).sort().forEach(m => { sorted[m] = ymmt[year].Rivian[m]; });
    ymmt[year].Rivian = sorted;
  }
});

Object.keys(ymmt).forEach(year => {
  const sortedMakes = {};
  Object.keys(ymmt[year]).sort().forEach(m => { sortedMakes[m] = ymmt[year][m]; });
  ymmt[year] = sortedMakes;
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Added ${addedCount} Rivian year/model combinations`);
console.log('\nBreakdown by model:');
for (const [m, c] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${m.padEnd(14)} ${c} years`);
}
