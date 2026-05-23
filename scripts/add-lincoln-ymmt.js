#!/usr/bin/env node
/**
 * Add Lincoln to YMMT — Ford luxury division.
 *
 * Lincoln is Ford's still-active luxury marque. Lineup spans the
 * Panther-platform Town Car era (through 2011), the alphabet-MK era
 * (MKZ/MKS/MKX/MKT/MKC), the Continental revival (2017-2020), and
 * the current SUV/crossover lineup (Navigator, Aviator, Nautilus,
 * Corsair). Some short-lived efforts (Blackwood, Mark LT pickup,
 * Zephyr sedan) are included for completeness.
 *
 * Year span: 1990-2026
 *
 * Sources for generation/trim data: Ford press releases, EPA fuel-
 * economy archives, Lincoln model history pages, and shared platform
 * data (e.g. Navigator/Expedition, Aviator/Explorer, Corsair/Escape).
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  // Body-on-frame full-size sedan — Panther platform (with Crown Vic / Grand Marquis)
  'Town Car': {
    1990: { end: 1997, trims: ['Executive', 'Signature', 'Cartier'] }, // Aero gen
    1998: { end: 2002, trims: ['Executive', 'Signature', 'Cartier', 'Touring'] }, // Refresh
    2003: { end: 2011, trims: ['Executive', 'Signature', 'Cartier', 'Designer', 'Signature L', 'Signature Limited', 'Executive L'] }, // Final gen
  },
  // Mid-size sedan — Fusion/MKZ platform (CD3, then CD4 from 2013)
  MKZ: {
    2007: { end: 2009, trims: ['Base', 'AWD'] }, // First gen Zephyr replacement (also "Zephyr" 2006 only)
    2010: { end: 2012, trims: ['Base', 'AWD', 'Hybrid'] }, // Refresh, FWD/AWD/Hybrid
    2013: { end: 2016, trims: ['Base', 'AWD', 'Hybrid', 'Black Label'] }, // CD4 gen, Black Label intro 2014
    2017: { end: 2020, trims: ['Premiere', 'Select', 'Reserve', 'Black Label', 'Hybrid'] }, // Mid-cycle refresh, 3.0L EcoBoost added
  },
  // Short-lived Fusion-platform sedan, immediate MKZ predecessor
  Zephyr: {
    2006: { end: 2006, trims: ['Base'] }, // 2006-only badge, became MKZ for 2007
  },
  // Full-size sedan — replaced Town Car at the top, then dropped
  MKS: {
    2009: { end: 2012, trims: ['Base', 'AWD', 'EcoBoost'] }, // Taurus-based, 3.7L V6 / 3.5L EcoBoost
    2013: { end: 2016, trims: ['Base', 'AWD', 'EcoBoost', 'EcoBoost AWD'] }, // Mid-cycle refresh
  },
  // Mid-size crossover — Edge-based
  MKX: {
    2007: { end: 2010, trims: ['Base', 'AWD', 'Limited Edition', 'Elite'] }, // First gen, with PA02 platform
    2011: { end: 2015, trims: ['Base', 'AWD'] }, // Refresh
    2016: { end: 2018, trims: ['Premiere', 'Select', 'Reserve', 'Black Label'] }, // CD4 platform — renamed Nautilus for 2019
  },
  // 3-row crossover — Flex/Explorer-related
  MKT: {
    2010: { end: 2012, trims: ['Base', 'EcoBoost', 'EcoBoost Elite'] }, // D4 platform with Flex
    2013: { end: 2019, trims: ['Base', 'EcoBoost', 'Livery', 'Town Car'] }, // Mostly fleet/livery sales after 2014 refresh
  },
  // Compact crossover — Escape-based
  MKC: {
    2015: { end: 2016, trims: ['Premiere', 'Select', 'Reserve', 'Black Label'] }, // First gen, on C1 platform
    2017: { end: 2019, trims: ['Premiere', 'Select', 'Reserve', 'Black Label'] }, // Mid-cycle, 2.0L/2.3L EcoBoost
  },
  // Continental — revived nameplate, mid-2010s
  Continental: {
    2017: { end: 2020, trims: ['Premiere', 'Select', 'Reserve', 'Black Label', '30H', '80th Anniversary'] }, // Revived on CD4, 3.7L V6 / 2.7L EcoBoost / 3.0L EcoBoost
  },
  // Full-size body-on-frame SUV — Expedition twin
  Navigator: {
    1998: { end: 2002, trims: ['Base', 'Premium', 'Luxury'] }, // First gen, UN173 / Expedition twin
    2003: { end: 2006, trims: ['Base', 'Luxury', 'Ultimate', 'Elite'] }, // Second gen, IRS introduced
    2007: { end: 2014, trims: ['Base', 'Ultimate', 'L', 'L Ultimate'] }, // Third gen, L (long) variant added
    2015: { end: 2017, trims: ['Select', 'Reserve', 'L Select', 'L Reserve', 'Black Label', 'L Black Label'] }, // Refresh w/ 3.5L EcoBoost (no more V8)
    2018: { end: 2024, trims: ['Standard', 'Select', 'Reserve', 'Black Label', 'L Standard', 'L Select', 'L Reserve', 'L Black Label'] }, // Fourth gen, U554
    2025: { end: 2026, trims: ['Reserve', 'Black Label', 'L Reserve', 'L Black Label'] }, // Refresh
  },
  // 3-row crossover — Aviator (revived nameplate)
  Aviator: {
    2003: { end: 2005, trims: ['Base', 'Luxury', 'Premium', 'Ultimate'] }, // First gen — Mountaineer/Explorer-based, body-on-frame
    2020: { end: 2024, trims: ['Standard', 'Reserve', 'Black Label', 'Grand Touring', 'Black Label Grand Touring'] }, // Revival — CD6 platform with Explorer, plug-in hybrid available
    2025: { end: 2026, trims: ['Premiere', 'Reserve', 'Black Label'] }, // Refresh
  },
  // Compact crossover — Corsair (replaced MKC)
  Corsair: {
    2020: { end: 2022, trims: ['Standard', 'Reserve', 'Grand Touring'] }, // Escape-based, C2 platform, 2.0/2.3L EcoBoost + PHEV Grand Touring
    2023: { end: 2026, trims: ['Standard', 'Reserve', 'Grand Touring'] }, // Refresh
  },
  // Mid-size crossover — Nautilus (renamed MKX)
  Nautilus: {
    2019: { end: 2023, trims: ['Standard', 'Select', 'Reserve', 'Black Label'] }, // Edge-platform refresh
    2024: { end: 2026, trims: ['Premiere', 'Reserve', 'Black Label'] }, // Second gen — Chinese-built, hybrid available
  },
  // LS — rear-drive sport sedan
  LS: {
    2000: { end: 2002, trims: ['LS6', 'LS8'] }, // First gen, DEW98 platform (with Jaguar S-Type, Thunderbird)
    2003: { end: 2006, trims: ['V6', 'V8', 'Sport', 'Ultimate'] }, // Refresh
  },
  // Mark VIII — personal luxury coupe
  'Mark VIII': {
    1993: { end: 1998, trims: ['Base', 'LSC', 'Diamond Anniversary', 'Collector\'s Edition'] }, // FN10 platform with Thunderbird/Cougar
  },
  // Mark LT — luxury pickup (F-150-based)
  'Mark LT': {
    2006: { end: 2008, trims: ['Base', '4x4'] }, // Short-lived US pickup, continued in Mexico through 2014
  },
  // Blackwood — luxury pickup truck (F-150-based)
  Blackwood: {
    2002: { end: 2002, trims: ['Base'] }, // One model year — 3,356 units total
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Lincoln) ymmt[yearStr].Lincoln = {};
  if (!ymmt[yearStr].Lincoln[model]) {
    ymmt[yearStr].Lincoln[model] = trims;
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

// Sort Lincoln models alphabetically for each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Lincoln) {
    const sorted = {};
    Object.keys(ymmt[year].Lincoln).sort().forEach(model => {
      sorted[model] = ymmt[year].Lincoln[model];
    });
    ymmt[year].Lincoln = sorted;
  }
});

// Re-sort makes for each year (so Lincoln sits alphabetically)
Object.keys(ymmt).forEach(year => {
  const sortedMakes = {};
  Object.keys(ymmt[year]).sort().forEach(make => {
    sortedMakes[make] = ymmt[year][make];
  });
  ymmt[year] = sortedMakes;
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Successfully added ${addedCount} Lincoln year/model combinations`);
console.log('\nBreakdown by model:');
for (const [model, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${model.padEnd(16)} ${count} years`);
}
