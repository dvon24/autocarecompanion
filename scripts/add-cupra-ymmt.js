#!/usr/bin/env node
/**
 * Add CUPRA to YMMT — SEAT performance spin-off (2018-present).
 *
 * CUPRA was the in-house performance trim line at SEAT until 2018, when
 * VW Group spun it out as its own marque to compete with Polestar/AMG/M.
 * Shares VW Group platforms (MQB, MEB). Small but fast-growing lineup —
 * Formentor was the breakout success, Born is the MEB-platform EV
 * counterpart to VW ID.3. Not sold in US (yet).
 *
 * Note: pre-2018 "SEAT Leon Cupra" / "SEAT Ibiza Cupra" are catalogued
 * under SEAT (see add-seat-ymmt.js), not here. CUPRA-as-make starts 2018.
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  Ateca: {
    2018: { end: 2026, trims: ['VZ', 'VZN', '2.0 TSI 4Drive', '300hp'] }, // first CUPRA-branded model
  },
  Leon: {
    2018: { end: 2020, trims: ['Cupra', 'Cupra R', 'Cupra ST'] }, // SEAT Leon Mk3 final CUPRA trims (brand transition)
    2020: { end: 2026, trims: ['VZ', 'VZ Cup', 'VZN', 'e-Hybrid', 'ST', 'Sportstourer'] }, // Mk4 as CUPRA marque
  },
  Formentor: {
    2020: { end: 2026, trims: ['V1', 'V2', 'V3', 'VZ', 'VZ5', 'VZN', 'e-Hybrid', 'Tribe Edition'] }, // CUPRA-only model
  },
  Born: {
    2022: { end: 2026, trims: ['Aurora Blue', 'Quantum Grey', 'V', 'VZ', 'e-Boost', 'Tribe Edition'] }, // EV (MEB platform)
  },
  Tavascan: {
    2024: { end: 2026, trims: ['Endurance', 'VZ', 'Tribe Edition'] }, // EV SUV (MEB platform)
  },
  Terramar: {
    2025: { end: 2026, trims: ['V1', 'V2', 'VZ', 'e-Hybrid'] }, // 2025 launch — replaces SEAT Ateca slot
  },
  Raval: {
    2026: { end: 2026, trims: ['V1', 'V2', 'VZ', 'Electric'] }, // upcoming small EV (CMP platform); some markets may delay
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].CUPRA) ymmt[yearStr].CUPRA = {};
  if (!ymmt[yearStr].CUPRA[model]) {
    ymmt[yearStr].CUPRA[model] = trims;
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
  if (ymmt[year].CUPRA) {
    const sorted = {};
    Object.keys(ymmt[year].CUPRA).sort().forEach(m => { sorted[m] = ymmt[year].CUPRA[m]; });
    ymmt[year].CUPRA = sorted;
  }
});

Object.keys(ymmt).forEach(year => {
  const sortedMakes = {};
  Object.keys(ymmt[year]).sort().forEach(m => { sortedMakes[m] = ymmt[year][m]; });
  ymmt[year] = sortedMakes;
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Added ${addedCount} CUPRA year/model combinations`);
console.log('\nBreakdown by model:');
for (const [m, c] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${m.padEnd(14)} ${c} years`);
}
