#!/usr/bin/env node
/**
 * Add Buick to YMMT — GM mid-luxury, still in production.
 *
 * Buick survived the 2009 GM bankruptcy because of the brand's massive
 * China popularity. Current US lineup is crossovers only (Encore GX,
 * Envision, Enclave) since the LaCrosse/Regal/Cascada were discontinued.
 *
 * Key platform notes:
 *   - LeSabre/Park Avenue/Bonneville/Eighty Eight all share the H-body
 *   - Regal (W-body) → Regal (Opel Insignia) → Regal Tour X wagon
 *   - Cascada was a rebadged Opel Cascada (German build)
 *   - Verano/Cruze shared Delta-2 platform
 *   - Encore/Trax/Mokka share GM Gamma-2
 *
 * Year span: 1990-2026
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  // Full-size FWD sedan — H-body
  LeSabre: {
    1990: { end: 1991, trims: ['Custom', 'Limited', 'Estate Wagon'] }, // 5th gen
    1992: { end: 1999, trims: ['Custom', 'Limited', '90th Anniversary'] }, // 6th gen (FWD H-body)
    2000: { end: 2005, trims: ['Custom', 'Limited', 'Celebration'] }, // 7th gen (final LeSabre)
  },
  // Full-size luxury — replaced Electra
  'Park Avenue': {
    1991: { end: 1996, trims: ['Base', 'Ultra'] }, // 1st gen as standalone (was Electra Park Avenue)
    1997: { end: 2005, trims: ['Base', 'Ultra', 'Special Edition'] }, // 2nd gen
  },
  // Midsize sedan — A-body, then W-body, then Epsilon
  Century: {
    1990: { end: 1996, trims: ['Custom', 'Special', 'Limited', 'Estate Wagon'] }, // A-body (3rd gen)
    1997: { end: 2005, trims: ['Custom', 'Limited', 'Special Edition'] }, // W-body (final Century)
  },
  // Sport/mid-luxury — W-body / Opel Insignia / China
  Regal: {
    1990: { end: 1996, trims: ['Custom', 'Limited', 'Gran Sport', 'GS'] }, // 3rd gen W-body coupe/sedan
    1997: { end: 2004, trims: ['LS', 'GS', 'GSE', 'Joseph Abboud'] }, // 4th gen W-body, supercharged GS
    2011: { end: 2013, trims: ['CXL', 'CXL Turbo', 'GS', 'Premium'] }, // 5th gen US (Opel Insignia A)
    2014: { end: 2017, trims: ['Base', 'Premium', 'Premium I', 'Premium II', 'GS', 'Sport Touring', 'Turbo'] }, // Refresh of 5th gen
    2018: { end: 2020, trims: ['Base', 'Preferred', 'Preferred II', 'Essence', 'GS', 'TourX', 'Sportback'] }, // Sportback liftback + TourX wagon (Insignia B)
  },
  // Mid-size sedan — replaced LeSabre/Park Avenue, dropped in 2019
  LaCrosse: {
    2005: { end: 2009, trims: ['CX', 'CXL', 'CXS', 'Super'] }, // 1st gen — Allure in Canada through 2009
    2010: { end: 2013, trims: ['CX', 'CXL', 'CXS', 'eAssist', 'Touring'] }, // 2nd gen, Epsilon II
    2014: { end: 2016, trims: ['Base', 'Leather', 'Premium I', 'Premium II', 'Premium III', 'Sport Touring', 'eAssist'] }, // Refresh
    2017: { end: 2019, trims: ['Base', 'Preferred', 'Essence', 'Premium', 'Sport Touring', 'Avenir'] }, // 3rd gen final
  },
  // Full-size luxury — replaced Park Avenue, predecessor to nothing
  Lucerne: {
    2006: { end: 2011, trims: ['CX', 'CXL', 'CXS', 'Super', 'Special Edition'] }, // Final Buick V8 (Northstar)
  },
  // Convertible — rebadged Opel Cascada
  Cascada: {
    2016: { end: 2019, trims: ['Base', 'Premium', 'Sport Touring'] }, // German-built Opel
  },
  // Compact sedan — Cruze-related Delta II
  Verano: {
    2012: { end: 2017, trims: ['Base', 'Convenience', 'Leather', 'Premium', 'Turbo', 'Sport Touring'] },
  },
  // Mid-size 3-row crossover — Lambda then C1XX
  Enclave: {
    2008: { end: 2012, trims: ['CX', 'CXL', 'CXL-1', 'CXL-2', 'Premium'] }, // 1st gen Lambda
    2013: { end: 2017, trims: ['Convenience', 'Leather', 'Premium', 'Tuscany Edition'] }, // Refresh
    2018: { end: 2022, trims: ['Preferred', 'Essence', 'Premium', 'Avenir'] }, // 2nd gen C1XX (with Traverse)
    2023: { end: 2024, trims: ['Preferred', 'Essence', 'Premium', 'Avenir'] }, // Refresh
    2025: { end: 2026, trims: ['Preferred', 'Avenir', 'Sport Touring'] }, // 3rd gen
  },
  // Subcompact crossover — Gamma-2 with Chevy Trax/Opel Mokka
  Encore: {
    2013: { end: 2016, trims: ['Base', 'Convenience', 'Leather', 'Premium', 'Sport Touring'] }, // 1st gen
    2017: { end: 2022, trims: ['Base', 'Preferred', 'Preferred II', 'Sport Touring', 'Essence', 'Premium'] }, // Refresh, then phased out
  },
  // Compact crossover — VSS-F platform
  'Encore GX': {
    2020: { end: 2024, trims: ['Preferred', 'Select', 'Essence', 'Sport Touring', 'Avenir'] }, // Korean-built
    2025: { end: 2026, trims: ['Preferred', 'Sport Touring', 'Avenir'] }, // Refresh
  },
  // Compact crossover — Equinox-related
  Envision: {
    2016: { end: 2018, trims: ['Base', 'Preferred', 'Essence', 'Premium', 'Premium II'] }, // 1st gen (China-built)
    2019: { end: 2020, trims: ['Preferred', 'Essence', 'Premium I', 'Premium II'] }, // Refresh
    2021: { end: 2026, trims: ['Preferred', 'Essence', 'Avenir', 'Sport Touring'] }, // 2nd gen
  },
  // Mid-size crossover — Pre-Enclave
  Rendezvous: {
    2002: { end: 2007, trims: ['CX', 'CXL', 'CXL Plus', 'Ultra'] }, // Aztek twin (slightly), GMT257
  },
  // Mid-size body-on-frame SUV — GMT360 (Trailblazer twin)
  Rainier: {
    2004: { end: 2007, trims: ['CXL', 'CXL Plus'] }, // Replacement for Roadmaster wagon
  },
  // Body-on-frame full-size sedan/wagon — B-body
  Roadmaster: {
    1991: { end: 1996, trims: ['Base', 'Limited', 'Estate Wagon'] }, // Final B-body, LT1 V8 from 1994
  },
  // Personal luxury coupe
  Riviera: {
    1990: { end: 1993, trims: ['Base', 'Anniversary'] }, // 7th gen
    1995: { end: 1999, trims: ['Base', 'Silver Arrow', 'Diamond Anniversary'] }, // 8th gen (supercharged), with skip year 1994
  },
  // Compact — N-body
  Skylark: {
    1990: { end: 1991, trims: ['Custom', 'Luxury Edition', 'Gran Sport'] }, // 6th gen
    1992: { end: 1998, trims: ['Custom', 'Limited', 'Gran Sport', 'GS'] }, // 7th gen final
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Buick) ymmt[yearStr].Buick = {};
  if (!ymmt[yearStr].Buick[model]) {
    ymmt[yearStr].Buick[model] = trims;
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

// Sort Buick models alphabetically for each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Buick) {
    const sorted = {};
    Object.keys(ymmt[year].Buick).sort().forEach(model => {
      sorted[model] = ymmt[year].Buick[model];
    });
    ymmt[year].Buick = sorted;
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

console.log(`\n✓ Successfully added ${addedCount} Buick year/model combinations`);
console.log('\nBreakdown by model:');
for (const [model, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${model.padEnd(14)} ${count} years`);
}
