#!/usr/bin/env node
/**
 * Add Tesla to YMMT — biggest single missing make.
 *
 * Tesla is the top global EV brand and our most-glaring absence.
 * Models: Roadster 1 (2008-2012), Model S (2012+), Model X (2015+),
 * Model 3 (2017+), Model Y (2020+), Cybertruck (2024+), Semi (2022+
 * fleet), Roadster 2 (TBD).
 *
 * Trim structure changes year-over-year — Tesla renames trims often
 * (e.g. Model 3 "Standard Range Plus" → "RWD"). Trim list is the
 * union of trims sold across all years of that generation.
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  Roadster: {
    2008: { end: 2012, trims: ['Base', 'Sport', '2.5', '2.5 Sport'] }, // 1st gen (Lotus Elise-based)
  },
  'Model S': {
    2012: { end: 2026, trims: [
      '40', '60', '60D', '70', '70D', '75', '75D', '85', '85D', 'P85', 'P85+', 'P85D',
      '90D', 'P90D', '100D', 'P100D',
      'Standard Range', 'Long Range', 'Long Range AWD', 'Performance',
      'Plaid', 'Plaid+',
    ] },
  },
  'Model X': {
    2015: { end: 2026, trims: [
      '60D', '70D', '75D', '90D', 'P90D', '100D', 'P100D',
      'Standard Range', 'Long Range', 'Long Range AWD', 'Performance',
      'Plaid',
    ] },
  },
  'Model 3': {
    2017: { end: 2026, trims: [
      'Standard Range', 'Standard Range Plus', 'Mid Range',
      'Long Range', 'Long Range AWD', 'Performance', 'RWD',
      'Highland', // 2024 refresh
    ] },
  },
  'Model Y': {
    2020: { end: 2026, trims: [
      'Standard Range', 'Long Range', 'Long Range AWD', 'Performance', 'RWD',
      'Juniper', // 2025 refresh
      'Juniper Long Range', 'Juniper Performance',
    ] },
  },
  Cybertruck: {
    2024: { end: 2026, trims: ['RWD', 'AWD', 'Cyberbeast', 'Foundation Series'] },
  },
  Semi: {
    2022: { end: 2026, trims: ['Day Cab', '500-mile', '300-mile'] }, // limited fleet release
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Tesla) ymmt[yearStr].Tesla = {};
  if (!ymmt[yearStr].Tesla[model]) {
    ymmt[yearStr].Tesla[model] = trims;
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
  if (ymmt[year].Tesla) {
    const sorted = {};
    Object.keys(ymmt[year].Tesla).sort().forEach(m => { sorted[m] = ymmt[year].Tesla[m]; });
    ymmt[year].Tesla = sorted;
  }
});

Object.keys(ymmt).forEach(year => {
  const sortedMakes = {};
  Object.keys(ymmt[year]).sort().forEach(m => { sortedMakes[m] = ymmt[year][m]; });
  ymmt[year] = sortedMakes;
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Added ${addedCount} Tesla year/model combinations`);
console.log('\nBreakdown by model:');
for (const [m, c] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${m.padEnd(14)} ${c} years`);
}
