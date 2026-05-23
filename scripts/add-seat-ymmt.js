#!/usr/bin/env node
/**
 * Add SEAT to YMMT — Spain's national brand (VW Group).
 *
 * SEAT (Sociedad Española de Automóviles de Turismo) is Spain's #1
 * domestic brand and ~5% of EU sales. VW Group subsidiary since 1986,
 * so platforms/engines mirror VW Polo/Golf/Tiguan. Not sold in US.
 * CUPRA is the performance spin-off (separate make from 2018).
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  Ibiza: {
    1993: { end: 2002, trims: ['CL', 'GLX', 'SXi', 'Sport', 'Cupra', 'Cupra Sport'] }, // 2nd gen (6K)
    2002: { end: 2008, trims: ['Reference', 'Stylance', 'Sport', 'FR', 'Cupra'] }, // 3rd gen (6L)
    2008: { end: 2017, trims: ['Reference', 'Style', 'Sport', 'FR', 'Cupra', 'SC', 'ST'] }, // 4th gen (6J/6P)
    2017: { end: 2026, trims: ['Reference', 'Style', 'Xcellence', 'FR', 'FR Sport', 'Beats', 'Anniversary'] }, // 5th gen (KJ)
  },
  Leon: {
    1999: { end: 2005, trims: ['Reference', 'Stella', 'Sport', 'TopSport', 'Cupra', 'Cupra R'] }, // 1st gen (1M)
    2005: { end: 2012, trims: ['Reference', 'Style', 'Sport', 'FR', 'Cupra', 'Cupra R'] }, // 2nd gen (1P)
    2012: { end: 2020, trims: ['Reference', 'Style', 'Xcellence', 'FR', 'Cupra', 'SC', 'ST', 'X-Perience'] }, // 3rd gen (5F)
    2020: { end: 2026, trims: ['Reference', 'Style', 'Xcellence', 'FR', 'FR Sport', 'e-Hybrid', 'ST'] }, // 4th gen (KL)
  },
  Ateca: {
    2016: { end: 2026, trims: ['Reference', 'Style', 'Xcellence', 'FR', 'FR Sport', 'Anniversary'] },
  },
  Arona: {
    2017: { end: 2026, trims: ['Reference', 'Style', 'Xcellence', 'FR', 'FR Sport', 'Anniversary'] },
  },
  Tarraco: {
    2019: { end: 2025, trims: ['Style', 'Xcellence', 'FR', 'FR Sport', 'e-Hybrid'] },
  },
  Alhambra: {
    1996: { end: 2010, trims: ['Reference', 'Stella', 'Sport', 'Vigo', 'TDI'] }, // 1st gen (7M)
    2010: { end: 2020, trims: ['Reference', 'Style', 'Xcellence', 'FR-Line', 'SE', 'SE L'] }, // 2nd gen (7N)
  },
  Toledo: {
    1991: { end: 1999, trims: ['CL', 'GLX', 'SXE', 'GT', 'Magnus', 'Sport'] }, // 1st gen (1L)
    1999: { end: 2004, trims: ['Reference', 'Stylance', 'Sport', 'TDI'] }, // 2nd gen (1M)
    2004: { end: 2009, trims: ['Reference', 'Stylance', 'Sport', 'TDI', '2.0 FSI'] }, // 3rd gen (5P)
    2012: { end: 2019, trims: ['Reference', 'Style', 'Xcellence', 'FR-Line', 'TDI'] }, // 4th gen (NH)
  },
  Mii: {
    2012: { end: 2021, trims: ['Reference', 'Style', 'Xcellence', 'FR-Line', 'Connect', 'Electric'] },
  },
  Altea: {
    2004: { end: 2015, trims: ['Reference', 'Stylance', 'FR', 'XL', 'Freetrack', 'Sport'] },
  },
  Cordoba: {
    1993: { end: 2009, trims: ['CL', 'GLX', 'SX', 'SXE', 'Sport', 'Cupra', 'Vario'] },
  },
  Exeo: {
    2009: { end: 2013, trims: ['Reference', 'Style', 'Sport', 'ST', 'Multitronic'] }, // rebadged Audi B7 A4
  },
  Marbella: {
    1990: { end: 1998, trims: ['Special', 'GL', 'Marbella'] }, // Fiat Panda 30/45 rebadge
  },
  Inca: {
    1995: { end: 2003, trims: ['Cargo', 'Crew'] }, // VW Caddy Mk2 rebadge (van)
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].SEAT) ymmt[yearStr].SEAT = {};
  if (!ymmt[yearStr].SEAT[model]) {
    ymmt[yearStr].SEAT[model] = trims;
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
  if (ymmt[year].SEAT) {
    const sorted = {};
    Object.keys(ymmt[year].SEAT).sort().forEach(m => { sorted[m] = ymmt[year].SEAT[m]; });
    ymmt[year].SEAT = sorted;
  }
});

Object.keys(ymmt).forEach(year => {
  const sortedMakes = {};
  Object.keys(ymmt[year]).sort().forEach(m => { sortedMakes[m] = ymmt[year][m]; });
  ymmt[year] = sortedMakes;
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Added ${addedCount} SEAT year/model combinations`);
console.log('\nBreakdown by model:');
for (const [m, c] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${m.padEnd(14)} ${c} years`);
}
