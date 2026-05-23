#!/usr/bin/env node
/**
 * Add Pontiac to YMMT — GM's "excitement" division (defunct 2010).
 *
 * Pontiac was killed in GM's 2009 bankruptcy reorganization; final
 * 2010 model-year cars trickled out into 2010 production. The lineup
 * was deeply badge-engineered (e.g. G3 = Chevy Aveo, Vibe = Toyota
 * Matrix, G8 = Holden Commodore, GTO 04-06 = Holden Monaro).
 *
 * Year span: 1990-2010
 *
 * Sources: GM press releases, EPA fuel-economy archives, the well-
 * documented Holden/Daewoo/Toyota platform-share history that defined
 * the brand's final decade.
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  // Compact — N-body (with Buick Skylark / Olds Achieva)
  'Grand Am': {
    1990: { end: 1991, trims: ['LE', 'SE', 'Quad 4'] }, // 3rd gen final years
    1992: { end: 1998, trims: ['SE', 'GT'] }, // 4th gen
    1999: { end: 2005, trims: ['SE', 'SE1', 'SE2', 'GT', 'GT1', 'GT-V6', 'V6'] }, // 5th gen final
  },
  // Mid-size — W-body
  'Grand Prix': {
    1990: { end: 1996, trims: ['LE', 'SE', 'STE', 'GT', 'GTP'] }, // 5th gen W-body
    1997: { end: 2003, trims: ['SE', 'GT', 'GTP', 'GTP Daytona 500', 'GTP 40th Anniversary'] }, // 6th gen, supercharged GTP
    2004: { end: 2008, trims: ['Base', 'GT', 'GT1', 'GT2', 'GTP', 'GXP'] }, // 7th gen final — GXP was 5.3L V8
  },
  // Subcompact — Chevy Aveo twin (Korean-built)
  G3: {
    2009: { end: 2010, trims: ['Base'] }, // Sold in Canada as G3 Wave starting 2005
  },
  // Compact — Delta platform (with Chevy Cobalt / Saturn Ion)
  G5: {
    2007: { end: 2009, trims: ['Base', 'GT', 'SE'] }, // Was Pursuit in Canada 2005-2006
  },
  // Mid-size — Epsilon (with Chevy Malibu / Saturn Aura)
  G6: {
    2005: { end: 2010, trims: ['Base', 'SE', 'GT', 'GTP', 'GXP'] }, // Replacement for Grand Am
  },
  // RWD sport sedan — Holden Commodore (VE) imported from Australia
  G8: {
    2008: { end: 2009, trims: ['Base', 'GT', 'GXP'] }, // 6.0L L76 / 6.2L LS3 in GXP
  },
  // Compact — J-body (replaced Sunbird)
  Sunfire: {
    1995: { end: 2005, trims: ['SE', 'GT', 'SL', 'SLX'] }, // Single long generation
  },
  // Subcompact — J-body (Sunfire predecessor)
  Sunbird: {
    1990: { end: 1994, trims: ['LE', 'SE', 'GT', 'Turbo'] }, // Final years before Sunfire
  },
  // Roadster — Kappa platform with Saturn Sky / Opel GT
  Solstice: {
    2006: { end: 2010, trims: ['Base', 'GXP', 'Coupe', 'Streetracer'] }, // Coupe added 2009
  },
  // RWD coupe revival — Holden Monaro (VZ) imported
  GTO: {
    2004: { end: 2006, trims: ['Base'] }, // LS1 (5.7L) in 2004, LS2 (6.0L) in 2005-2006
  },
  // Compact wagon/hatch — Toyota Matrix twin (NUMMI-built)
  Vibe: {
    2003: { end: 2008, trims: ['Base', 'GT', 'AWD'] }, // 1st gen
    2009: { end: 2010, trims: ['Base', 'AWD', '2.4L', 'GT'] }, // 2nd gen short run
  },
  // Full-size — H-body (with Buick LeSabre / Olds Eighty Eight)
  Bonneville: {
    1990: { end: 1991, trims: ['LE', 'SE', 'SSE'] }, // 8th gen first years
    1992: { end: 1999, trims: ['SE', 'SSE', 'SSEi'] }, // 9th gen (supercharged SSEi)
    2000: { end: 2005, trims: ['SE', 'SLE', 'SSEi', 'GXP'] }, // 10th gen final, GXP was Northstar V8
  },
  // Crossover — GMT257 platform with Buick Rendezvous
  Aztek: {
    2001: { end: 2005, trims: ['Base', 'GT', 'AWD', 'Rally'] }, // Infamous for styling, popularized by Breaking Bad
  },
  // Compact crossover — Theta with Chevy Equinox
  Torrent: {
    2006: { end: 2009, trims: ['Base', 'AWD', 'GXP', 'Sport'] }, // Equinox twin, GXP added late
  },
  // Minivan — APV (dustbuster)
  'Trans Sport': {
    1990: { end: 1996, trims: ['SE', 'GT'] }, // 1st gen "dustbuster"
    1997: { end: 1998, trims: ['Base', 'Montana'] }, // U-body — became Montana for 1999
  },
  // Minivan — U-body (was Trans Sport)
  Montana: {
    1999: { end: 2005, trims: ['Base', 'Vista', 'M16', 'MontanaVision'] }, // SWB Montana
    2006: { end: 2009, trims: ['SV6', 'SV6 Extended', 'SV6 LWB'] }, // Montana SV6 (Canada-only post-2006)
  },
  // F-body coupe
  Firebird: {
    1990: { end: 1992, trims: ['Base', 'Formula', 'Trans Am', 'Trans Am GTA'] }, // 3rd gen final
    1993: { end: 2002, trims: ['Base', 'Formula', 'Trans Am', 'WS6', 'Firehawk', '30th Anniversary', '35th Anniversary'] }, // 4th gen — discontinued 2002 with Camaro
  },
  // Sometimes-separate trim, sometimes a standalone
  'Trans Am': {
    1990: { end: 1992, trims: ['Base', 'GTA'] }, // Sold as separate "Trans Am" in some EPA / GM materials
    1993: { end: 2002, trims: ['Base', 'WS6', 'Firehawk', '30th Anniversary', 'Collector Edition'] },
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Pontiac) ymmt[yearStr].Pontiac = {};
  if (!ymmt[yearStr].Pontiac[model]) {
    ymmt[yearStr].Pontiac[model] = trims;
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

// Sort Pontiac models alphabetically for each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Pontiac) {
    const sorted = {};
    Object.keys(ymmt[year].Pontiac).sort().forEach(model => {
      sorted[model] = ymmt[year].Pontiac[model];
    });
    ymmt[year].Pontiac = sorted;
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

console.log(`\n✓ Successfully added ${addedCount} Pontiac year/model combinations`);
console.log('\nBreakdown by model:');
for (const [model, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${model.padEnd(14)} ${count} years`);
}
