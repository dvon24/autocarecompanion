#!/usr/bin/env node
/**
 * Add Polestar to YMMT — Volvo/Geely EV brand.
 *
 * Polestar was Volvo's performance tuning shop, spun out as separate
 * marque in 2017. Polestar 1 was a $155k PHEV coupe (2019-2021, limited
 * to ~1,500 units). Polestar 2 onward are full EVs. Volvo sister brand
 * sharing platforms (CMA and SPA2).
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  'Polestar 1': {
    2019: { end: 2021, trims: ['Base'] }, // limited-production PHEV coupe (1,500 units total)
  },
  'Polestar 2': {
    2020: { end: 2026, trims: [
      'Standard Range Single Motor',
      'Long Range Single Motor',
      'Long Range Dual Motor',
      'Performance Pack',
      'BST 270', // limited Performance pack edition
      'Launch Edition',
    ] },
  },
  'Polestar 3': {
    2023: { end: 2026, trims: [
      'Long Range Single Motor',
      'Long Range Dual Motor',
      'Performance Pack',
      'Launch Edition',
    ] },
  },
  'Polestar 4': {
    2024: { end: 2026, trims: [
      'Long Range Single Motor',
      'Long Range Dual Motor',
      'Performance',
      'Launch Edition',
    ] },
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Polestar) ymmt[yearStr].Polestar = {};
  if (!ymmt[yearStr].Polestar[model]) {
    ymmt[yearStr].Polestar[model] = trims;
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
  if (ymmt[year].Polestar) {
    const sorted = {};
    Object.keys(ymmt[year].Polestar).sort().forEach(m => { sorted[m] = ymmt[year].Polestar[m]; });
    ymmt[year].Polestar = sorted;
  }
});

Object.keys(ymmt).forEach(year => {
  const sortedMakes = {};
  Object.keys(ymmt[year]).sort().forEach(m => { sortedMakes[m] = ymmt[year][m]; });
  ymmt[year] = sortedMakes;
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Added ${addedCount} Polestar year/model combinations`);
console.log('\nBreakdown by model:');
for (const [m, c] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${m.padEnd(18)} ${c} years`);
}
