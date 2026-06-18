#!/usr/bin/env node
/**
 * Add the net-new German/EU-bestseller nameplates to YMMT so they are
 * selectable in the diagnose / parts / garage pickers. Pairs with the
 * research-de-netnew wave (data/_wf-netnew-out.json). Opel Combo already
 * exists in YMMT (added with the Opel batch), so it is intentionally
 * omitted here.
 *
 * EU-market year ranges. Run AFTER the net-new issues are persisted +
 * promoted, then commit public/data/ymmt.json + deploy.
 *
 * Usage: node scripts/add-de-netnew-ymmt.js
 */
const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// make -> model -> { startYear: { end, trims } }
const DATA = {
  Volkswagen: {
    'T-Roc': {
      2018: { end: 2026, trims: ['Design', 'Style', 'R-Line', 'R', 'Cabriolet', '1.0 TSI', '1.5 TSI', '2.0 TSI', '2.0 TDI'] },
    },
    'T-Cross': {
      2019: { end: 2026, trims: ['S', 'SE', 'SEL', 'Style', 'R-Line', 'Life', '1.0 TSI', '1.5 TSI'] },
    },
    Touran: {
      2003: { end: 2010, trims: ['S', 'SE', 'Sport', 'Trendline', 'Comfortline', 'Highline'] },
      2010: { end: 2015, trims: ['S', 'SE', 'Trendline', 'Comfortline', 'Highline', 'BlueMotion'] },
      2015: { end: 2026, trims: ['S', 'SE', 'SEL', 'R-Line', 'Comfortline', 'Highline'] },
    },
    'ID.3': {
      2020: { end: 2026, trims: ['Pure', 'Pro', 'Pro S', 'Tour', 'GTX', 'Life', 'Style', 'Max'] },
    },
  },
  Audi: {
    Q2: {
      2016: { end: 2026, trims: ['Sport', 'S line', 'Black Edition', 'SQ2', '30 TFSI', '35 TFSI', '35 TDI'] },
    },
    A1: {
      2010: { end: 2018, trims: ['SE', 'Sport', 'S line', 'S1', '1.4 TFSI', '1.6 TDI'] }, // 8X
      2018: { end: 2026, trims: ['Sportback', 'SE', 'Sport', 'S line', 'Citycarver', '25 TFSI', '30 TFSI', '35 TFSI'] }, // GB
    },
  },
  BMW: {
    '2 Series Active Tourer': {
      2014: { end: 2021, trims: ['SE', 'Sport', 'Luxury', 'M Sport', '218i', '220i', '216d', '218d', '220d', '225xe'] }, // F45
      2022: { end: 2026, trims: ['Sport', 'Luxury', 'M Sport', '218i', '220i', '218d', '223i', '225e', '230e'] }, // U06
    },
  },
  'Mercedes-Benz': {
    'V-Class': {
      2014: { end: 2026, trims: ['V200d', 'V220d', 'V250d', 'V300d', 'Avantgarde', 'AMG Line', 'Exclusive', 'Marco Polo'] }, // W447
    },
    EQC: {
      2019: { end: 2024, trims: ['EQC 400 4MATIC', 'AMG Line', 'Premium', 'Premium Plus', 'Sport'] }, // N293
    },
  },
};

function addModelToYear(year, make, model, trims) {
  const y = year.toString();
  if (!ymmt[y]) ymmt[y] = {};
  if (!ymmt[y][make]) ymmt[y][make] = {};
  if (!ymmt[y][make][model]) { ymmt[y][make][model] = trims; return true; }
  return false;
}

let added = 0;
const stats = {};
for (const [make, models] of Object.entries(DATA)) {
  for (const [model, gens] of Object.entries(models)) {
    const key = `${make} ${model}`;
    stats[key] = 0;
    for (const [startStr, { end, trims }] of Object.entries(gens)) {
      for (let year = parseInt(startStr, 10); year <= end; year++) {
        if (addModelToYear(year, make, model, trims)) { added++; stats[key]++; }
      }
    }
  }
}

// Re-sort models within each affected make, then makes within each year.
for (const year of Object.keys(ymmt)) {
  for (const make of Object.keys(DATA)) {
    if (ymmt[year][make]) {
      const sorted = {};
      Object.keys(ymmt[year][make]).sort().forEach((m) => { sorted[m] = ymmt[year][make][m]; });
      ymmt[year][make] = sorted;
    }
  }
  const sortedMakes = {};
  Object.keys(ymmt[year]).sort().forEach((mk) => { sortedMakes[mk] = ymmt[year][mk]; });
  ymmt[year] = sortedMakes;
}

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log(`✓ Added ${added} year/make/model combinations`);
for (const [k, n] of Object.entries(stats).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(28)} ${n} years`);
