#!/usr/bin/env node
/**
 * Add Saturn to YMMT — GM's "different kind of car company" (defunct 2010).
 *
 * Saturn launched in 1990 with the original S-Series (SL/SC/SW),
 * polymer body panels and the "no-haggle" sales model. Later years
 * leaned on Opel-derived models (Astra, Aura, Vue) and GM-platform
 * twins (Outlook, Sky). GM tried to sell to Penske in 2009; deal
 * collapsed, brand was wound down through 2010.
 *
 * Year span: 1990-2010
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  // S-Series — Saturn's foundational compact (SL sedan, SC coupe, SW wagon)
  // Treat as three model lines because they really were sold under those
  // distinct nameplates (with shared platform).
  SL: {
    1991: { end: 1995, trims: ['Base', 'SL1', 'SL2'] }, // 1st gen sedan
    1996: { end: 1999, trims: ['SL', 'SL1', 'SL2'] }, // Mid-cycle refresh
    2000: { end: 2002, trims: ['SL', 'SL1', 'SL2'] }, // 2nd gen sedan
  },
  SC: {
    1991: { end: 1996, trims: ['SC1', 'SC2'] }, // 1st gen coupe
    1997: { end: 2002, trims: ['SC1', 'SC2'] }, // 2nd gen — 3-door coupe with rear suicide door
  },
  SW: {
    1993: { end: 1999, trims: ['SW1', 'SW2'] }, // 1st gen wagon
    2000: { end: 2001, trims: ['SW1', 'SW2'] }, // 2nd gen wagon (final years)
  },
  // L-Series — mid-size (Opel Vectra B-based, built in Wilmington)
  LS: {
    2000: { end: 2002, trims: ['LS', 'LS1', 'LS2'] }, // 4-cyl L-Series
  },
  LW: {
    2000: { end: 2002, trims: ['LW1', 'LW2', 'LW200', 'LW300'] }, // L-Series wagon
  },
  // L-Series 3.0 V6 sedan
  L: {
    2003: { end: 2005, trims: ['L200', 'L300', 'L300-1', 'L300-2', 'L300-3'] }, // Refresh / renamed
  },
  // Compact — Delta platform (with Chevy Cobalt / Pontiac G5)
  Ion: {
    2003: { end: 2007, trims: ['1', '2', '3', 'Red Line', 'Quad Coupe'] }, // S-Series replacement
  },
  // Compact crossover — Theta with Chevy Equinox / Suzuki XL7
  Vue: {
    2002: { end: 2007, trims: ['Base', 'V6', 'AWD', 'Red Line', 'Hybrid'] }, // 1st gen
    2008: { end: 2010, trims: ['XE', 'XR', 'XR V6', 'Red Line', 'Green Line Hybrid', 'Green Line 2 Mode Hybrid'] }, // 2nd gen — Opel Antara twin
  },
  // Roadster — Kappa platform (with Pontiac Solstice / Opel GT)
  Sky: {
    2007: { end: 2010, trims: ['Base', 'Red Line', 'Ruby Red Limited Edition'] }, // Pontiac Solstice twin
  },
  // Mid-size sedan — Epsilon (with Chevy Malibu / Pontiac G6 / Opel Vectra C)
  Aura: {
    2007: { end: 2009, trims: ['XE', 'XR', 'Green Line Hybrid', 'XR Special Edition'] }, // 2007 NA Car of the Year
  },
  // 3-row crossover — Lambda (with Buick Enclave / GMC Acadia / Chevy Traverse)
  Outlook: {
    2007: { end: 2010, trims: ['XE', 'XR', 'AWD'] }, // 1st-and-only gen
  },
  // Compact — Opel Astra H imported from Belgium
  Astra: {
    2008: { end: 2009, trims: ['XE 3-door', 'XR 3-door', 'XE 5-door', 'XR 5-door'] }, // Saturn's final non-truck
  },
  // Minivan — Chevy Uplander twin
  Relay: {
    2005: { end: 2007, trims: ['Base', 'Relay-2', 'Relay-3'] }, // GMT201 — short-lived crossover-van
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Saturn) ymmt[yearStr].Saturn = {};
  if (!ymmt[yearStr].Saturn[model]) {
    ymmt[yearStr].Saturn[model] = trims;
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

// Sort Saturn models alphabetically for each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Saturn) {
    const sorted = {};
    Object.keys(ymmt[year].Saturn).sort().forEach(model => {
      sorted[model] = ymmt[year].Saturn[model];
    });
    ymmt[year].Saturn = sorted;
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

console.log(`\n✓ Successfully added ${addedCount} Saturn year/model combinations`);
console.log('\nBreakdown by model:');
for (const [model, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${model.padEnd(14)} ${count} years`);
}
