#!/usr/bin/env node
/**
 * Add Dacia to YMMT — Romanian budget brand under Renault Group.
 *
 * Dacia is the biggest budget brand in Europe — Sandero is consistently
 * a top-5 EU seller and Duster is top-10. Renault acquired Dacia in
 * 1999; pre-1999 models are essentially licensed Renault 12s with
 * Romanian production. Not sold in US.
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  Sandero: {
    2008: { end: 2012, trims: ['Access', 'Ambiance', 'Laureate', 'Stepway'] }, // 1st gen
    2012: { end: 2020, trims: ['Access', 'Ambiance', 'Laureate', 'Lauréate Prime', 'Stepway', 'Stepway Prestige'] }, // 2nd gen
    2020: { end: 2026, trims: ['Access', 'Essential', 'Comfort', 'Expression', 'Extreme', 'Stepway', 'Stepway Extreme'] }, // 3rd gen
  },
  Logan: {
    2004: { end: 2012, trims: ['Access', 'Ambiance', 'Laureate', 'Pickup', 'MCV'] }, // 1st gen
    2012: { end: 2020, trims: ['Access', 'Ambiance', 'Laureate', 'MCV', 'MCV Stepway'] }, // 2nd gen
    2020: { end: 2026, trims: ['Essential', 'Comfort', 'Expression', 'MCV'] }, // 3rd gen (continues only in some markets)
  },
  Duster: {
    2010: { end: 2017, trims: ['Access', 'Ambiance', 'Laureate', 'Adventure', 'Black Touch'] }, // 1st gen
    2017: { end: 2023, trims: ['Access', 'Essential', 'Comfort', 'Prestige', 'Techroad', 'SE', 'Extreme'] }, // 2nd gen
    2024: { end: 2026, trims: ['Essential', 'Expression', 'Journey', 'Extreme', 'Hybrid 140', 'Mild Hybrid 130 4x4'] }, // 3rd gen
  },
  Spring: {
    2021: { end: 2026, trims: ['Essential', 'Expression', 'Extreme', 'Cargo', 'Electric 45', 'Electric 65'] }, // EV city car
  },
  Jogger: {
    2022: { end: 2026, trims: ['Essential', 'Expression', 'Extreme', 'Hybrid 140', '5-seat', '7-seat'] }, // 7-seater MPV/wagon hybrid
  },
  Lodgy: {
    2012: { end: 2022, trims: ['Access', 'Ambiance', 'Laureate', 'Stepway', '5-seat', '7-seat'] }, // family MPV
  },
  Dokker: {
    2012: { end: 2021, trims: ['Access', 'Ambiance', 'Laureate', 'Stepway', 'Van'] }, // small van/MPV
  },
  Solenza: {
    2003: { end: 2005, trims: ['Confort', 'Clima', 'Rapsodie', 'Scala'] }, // last pre-Renault platform car
  },
  Nova: {
    1995: { end: 1999, trims: ['Base', 'GT', 'GTI'] }, // 1995-1999 (Romanian hatch)
  },
  SuperNova: {
    2000: { end: 2003, trims: ['Confort', 'Rapsodie', 'Campus'] }, // updated Nova
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Dacia) ymmt[yearStr].Dacia = {};
  if (!ymmt[yearStr].Dacia[model]) {
    ymmt[yearStr].Dacia[model] = trims;
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
  if (ymmt[year].Dacia) {
    const sorted = {};
    Object.keys(ymmt[year].Dacia).sort().forEach(m => { sorted[m] = ymmt[year].Dacia[m]; });
    ymmt[year].Dacia = sorted;
  }
});

Object.keys(ymmt).forEach(year => {
  const sortedMakes = {};
  Object.keys(ymmt[year]).sort().forEach(m => { sortedMakes[m] = ymmt[year][m]; });
  ymmt[year] = sortedMakes;
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Added ${addedCount} Dacia year/model combinations`);
console.log('\nBreakdown by model:');
for (const [m, c] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${m.padEnd(14)} ${c} years`);
}
