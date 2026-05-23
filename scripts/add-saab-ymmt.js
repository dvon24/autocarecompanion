#!/usr/bin/env node
/**
 * Add Saab to YMMT — Swedish maker (defunct 2012).
 *
 * Saab Automobile was owned by GM 2000-2010 and consequently shares
 * platforms with Opel/Vauxhall (9-3/9-5 on Epsilon/Epsilon-II) and
 * Subaru (9-2X) and Chevy TrailBlazer (9-7X). After GM, Spyker bought
 * the brand in 2010; bankruptcy followed in 2011 and final cars rolled
 * out under the Saab name in early 2012.
 *
 * Year span: 1990-2012
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  // Classic 900 (1979-1994) / NG900 (1994-1998)
  900: {
    1990: { end: 1993, trims: ['S', 'SE', 'Turbo', 'Turbo Convertible', 'SPG'] }, // Classic 900 (Type 1)
    1994: { end: 1998, trims: ['S', 'SE', 'Turbo', 'SE Turbo', 'Convertible', 'Talladega'] }, // NG900 (Type 2) — first GM-platform Saab
  },
  // 9000 — flagship (until 9-5)
  9000: {
    1990: { end: 1998, trims: ['S', 'CD', 'CDE', 'CSE', 'CS', 'Turbo', 'Aero', 'Griffin'] }, // Single generation
  },
  // 9-3 — replaced NG900 in 1999
  '9-3': {
    1999: { end: 2003, trims: ['Base', 'SE', 'Aero', 'Turbo', 'Viggen', 'Convertible', '5-door'] }, // 1st gen 9-3 (OG9-3)
    2003: { end: 2007, trims: ['Linear', 'Arc', 'Vector', 'Aero', '2.0t', '2.0T', 'Convertible'] }, // 2nd gen (Sport Sedan / SportCombi 2005+), Epsilon platform
    2008: { end: 2011, trims: ['2.0T', 'Aero', 'Aero XWD', 'Turbo4', 'Turbo X', 'Convertible', 'SportCombi'] }, // Refresh
    2012: { end: 2012, trims: ['2.0T', 'Aero'] }, // Final year under Spyker / NEVS
  },
  // 9-5 — flagship sedan/wagon
  '9-5': {
    1999: { end: 2009, trims: ['Linear', 'Arc', 'Vector', 'Aero', 'SportCombi', 'Anniversary Edition'] }, // 1st gen — long run with mid-cycle refreshes (2002, 2006)
    2010: { end: 2011, trims: ['Turbo4', 'Turbo4 Premium', 'Aero', 'Aero XWD', 'SportCombi'] }, // 2nd gen — Epsilon II, very short run before bankruptcy
  },
  // 9-2X — Subaru Impreza WRX rebadge (WI/IL build, then JP)
  '9-2X': {
    2005: { end: 2006, trims: ['Linear', '2.5i', 'Aero'] }, // GM era — "Saabaru"
  },
  // 9-7X — Chevy TrailBlazer / GMC Envoy rebadge, body-on-frame
  '9-7X': {
    2005: { end: 2009, trims: ['Linear', 'Arc', '4.2i', '5.3i', 'Aero'] }, // GMT360 platform
  },
  // 9-4X — crossover (Cadillac SRX-related)
  '9-4X': {
    2011: { end: 2011, trims: ['3.0i Premium', '3.0i Aero', 'Aero XWD'] }, // ~800 units built before bankruptcy — Mexico-built
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Saab) ymmt[yearStr].Saab = {};
  if (!ymmt[yearStr].Saab[model]) {
    ymmt[yearStr].Saab[model] = trims;
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
      if (addModelToYear(year, model, trims)) {
        addedCount++;
        stats[model]++;
      }
    }
  }
}

// Sort Saab models alphabetically for each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Saab) {
    const sorted = {};
    Object.keys(ymmt[year].Saab).sort().forEach(model => {
      sorted[model] = ymmt[year].Saab[model];
    });
    ymmt[year].Saab = sorted;
  }
});

// Re-sort makes for each year
Object.keys(ymmt).forEach(year => {
  const sortedMakes = {};
  Object.keys(ymmt[year]).sort().forEach(make => {
    sortedMakes[make] = ymmt[year][make];
  });
  ymmt[year] = sortedMakes;
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Successfully added ${addedCount} Saab year/model combinations`);
console.log('\nBreakdown by model:');
for (const [model, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${model.padEnd(10)} ${count} years`);
}
