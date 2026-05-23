#!/usr/bin/env node
/**
 * Add Skoda to YMMT — German market launch prerequisite.
 *
 * Skoda is a Czech VW Group brand and one of the top sellers in Germany
 * (Octavia is consistently in Germany's top 5). Not sold in the US since
 * 1991, so Skoda fills a gap for European market searches.
 *
 * Models added (with rough trim taxonomy by era — Skoda doesn't use
 * standardized trim names like US brands; trims vary by year and market):
 *
 *   Octavia 1996+    — flagship, 4 generations (Mk1 → Mk4)
 *   Fabia 1999+      — supermini, 4 generations
 *   Superb 2001+     — large saloon, 4 generations
 *   Kodiaq 2016+     — 7-seat SUV (Germany's family SUV)
 *   Karoq 2017+      — 5-seat compact SUV
 *   Kamiq 2019+      — subcompact SUV
 *   Scala 2019+      — compact hatch
 *   Enyaq 2020+      — EV SUV (iV + Coupe variants)
 *   Yeti 2009-2017   — discontinued but huge in used market
 *   Citigo 2011-2020 — A-segment city car (discontinued)
 *   Rapid 2012-2019  — compact saloon (discontinued)
 *   Roomster 2006-2015 — MPV (discontinued)
 *   Felicia 1994-2001 — pre-VW-era heritage model
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Modern Skoda trims (2010+): Active, Ambition, Style, L&K (Laurin & Klement),
// Sportline, RS/vRS, Monte Carlo, Scout (Octavia/Kodiaq only)
// Older Skoda trims (90s-00s): GLX, LX, SLX, LXi, Elegance

const MODELS = {
  Octavia: {
    1996: { end: 2010, trims: ['LX', 'GLX', 'SLX', 'RS', 'Elegance', 'Combi'] }, // Mk1
    2004: { end: 2013, trims: ['Classic', 'Ambiente', 'Elegance', 'RS', 'Scout', 'Combi'] }, // Mk2
    2012: { end: 2020, trims: ['Active', 'Ambition', 'Elegance', 'Style', 'L&K', 'Sportline', 'RS', 'Scout', 'G-TEC'] }, // Mk3
    2019: { end: 2026, trims: ['Active', 'Ambition', 'Style', 'L&K', 'Sportline', 'RS', 'RS iV', 'Scout', 'Selection'] }, // Mk4
  },
  Fabia: {
    1999: { end: 2014, trims: ['Classic', 'Comfort', 'Elegance', 'Sport', 'Combi'] }, // Mk1
    2007: { end: 2014, trims: ['Classic', 'Active', 'Ambiente', 'Sport', 'Monte Carlo', 'RS', 'Combi'] }, // Mk2
    2014: { end: 2021, trims: ['Active', 'Ambition', 'Style', 'Monte Carlo', 'Sportline', 'Combi'] }, // Mk3
    2021: { end: 2026, trims: ['Active', 'Ambition', 'Style', 'Monte Carlo', 'Sportline', 'Selection'] }, // Mk4
  },
  Superb: {
    2001: { end: 2008, trims: ['Classic', 'Comfort', 'Elegance', 'L&K'] }, // Mk1
    2008: { end: 2015, trims: ['Active', 'Ambition', 'Elegance', 'L&K', 'Sportline', 'Combi'] }, // Mk2
    2015: { end: 2024, trims: ['Active', 'Ambition', 'Style', 'L&K', 'Sportline', 'iV', 'Scout', 'Combi'] }, // Mk3
    2023: { end: 2026, trims: ['Selection', 'Sportline', 'L&K', 'Combi'] }, // Mk4
  },
  Kodiaq: {
    2016: { end: 2024, trims: ['Active', 'Ambition', 'Style', 'Sportline', 'L&K', 'RS', 'Scout'] },
    2023: { end: 2026, trims: ['Selection', 'Sportline', 'L&K', 'RS'] }, // Mk2
  },
  Karoq: {
    2017: { end: 2026, trims: ['Active', 'Ambition', 'Style', 'Sportline', 'Scout', 'Selection'] },
  },
  Kamiq: {
    2019: { end: 2026, trims: ['Active', 'Ambition', 'Style', 'Monte Carlo', 'Sportline', 'Selection'] },
  },
  Scala: {
    2019: { end: 2026, trims: ['Active', 'Ambition', 'Style', 'Monte Carlo', 'Sportline', 'Selection'] },
  },
  Enyaq: {
    2020: { end: 2026, trims: ['50', '60', '60 iV', '80', '80x', '85', '85x', 'RS', 'Sportline', 'L&K', 'Coupe', 'Coupe RS'] },
  },
  Yeti: {
    2009: { end: 2017, trims: ['Active', 'Ambition', 'Elegance', 'Outdoor', 'Monte Carlo', 'L&K'] },
  },
  Citigo: {
    2011: { end: 2020, trims: ['Active', 'Ambition', 'Style', 'Monte Carlo', 'iV'] },
  },
  Rapid: {
    2012: { end: 2019, trims: ['Active', 'Ambition', 'Style', 'Monte Carlo', 'Spaceback'] },
  },
  Roomster: {
    2006: { end: 2015, trims: ['Active', 'Ambition', 'Style', 'Scout', 'Praktik'] },
  },
  Felicia: {
    1994: { end: 2001, trims: ['LX', 'GLX', 'SLX', 'Combi', 'Fun'] },
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Skoda) ymmt[yearStr].Skoda = {};
  if (!ymmt[yearStr].Skoda[model]) {
    ymmt[yearStr].Skoda[model] = trims;
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
      // For year ranges that span generations, the later generation's trims
      // win (since loops execute in object-insertion order, which for
      // numeric-string keys is ascending — the newer gen overwrites the older
      // for overlap years).
      if (addModelToYear(year, model, trims)) {
        addedCount++;
        stats[model]++;
      }
    }
  }
}

// Sort Skoda models alphabetically for each year (matches existing convention)
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Skoda) {
    const sorted = {};
    Object.keys(ymmt[year].Skoda).sort().forEach(model => {
      sorted[model] = ymmt[year].Skoda[model];
    });
    ymmt[year].Skoda = sorted;
  }
});

// Also sort the makes for each year so Skoda lands in alphabetical position
Object.keys(ymmt).forEach(year => {
  const sortedMakes = {};
  Object.keys(ymmt[year]).sort().forEach(make => {
    sortedMakes[make] = ymmt[year][make];
  });
  ymmt[year] = sortedMakes;
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Successfully added ${addedCount} Skoda year/model combinations`);
console.log('\nBreakdown by model:');
for (const [model, count] of Object.entries(stats)) {
  console.log(`  ${model.padEnd(12)} ${count} years`);
}
console.log('\nSkoda is now in YMMT. Next: add KnownIssue rows via scripts/add-skoda-issues.js');
