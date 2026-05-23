#!/usr/bin/env node
/**
 * Add Suzuki to YMMT — global market launch.
 *
 * Suzuki is the biggest "missing" make in our catalog. Japanese global
 * brand: #1 in India (via Maruti Suzuki), top-10 in UK/Italy/Hungary,
 * exited US market in 2012 but huge in Europe and emerging markets.
 * Bridges to future Hindi expansion since Maruti is India's #1 brand.
 *
 * Models cover both global lineup and US-only releases (1990-2012).
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  Swift: {
    1989: { end: 1994, trims: ['GA', 'GL', 'GS', 'GT', 'GTi'] }, // 1st gen JDM
    2004: { end: 2010, trims: ['Base', 'GL', 'GLX', 'Sport', 'SZ', 'Attitude'] }, // 3rd gen
    2010: { end: 2017, trims: ['SZ2', 'SZ3', 'SZ4', 'SZ-L', 'Sport', 'Attitude'] }, // 4th gen
    2017: { end: 2026, trims: ['SZ3', 'SZ5', 'SZ-T', 'SZ-L', 'Sport', 'Hybrid', 'AllGrip'] }, // 5th gen
  },
  Vitara: {
    1989: { end: 1998, trims: ['JLX', 'JX', 'JS', 'Sidekick'] }, // 1st gen (also Sidekick in US)
    1998: { end: 2005, trims: ['JLX', 'JX', 'JLS', 'Convertible', 'Grand Vitara'] }, // 2nd gen
    2015: { end: 2026, trims: ['SZ4', 'SZ5', 'SZ-T', 'S', 'Sport', 'Allgrip', 'Hybrid'] }, // 4th gen (current)
  },
  'Grand Vitara': {
    1998: { end: 2005, trims: ['JLX', 'JX', 'JLS', 'XL-7', 'Limited'] }, // 1st gen
    2005: { end: 2015, trims: ['Base', 'Premium', 'Luxury', 'XL-7', 'Limited', 'Urban', 'Ultimate'] }, // 2nd gen
    2022: { end: 2026, trims: ['Sigma', 'Delta', 'Zeta', 'Alpha', 'Hybrid'] }, // 3rd gen (Maruti / India-led)
  },
  Jimny: {
    1998: { end: 2018, trims: ['JLX', 'JX', 'SZ3', 'SZ4', 'Mode'] }, // 3rd gen (long life)
    2018: { end: 2026, trims: ['SZ4', 'SZ5', 'Pro', 'Commercial', 'Sierra', 'Heritage'] }, // 4th gen
  },
  'SX4': {
    2007: { end: 2014, trims: ['Base', 'GL', 'GLX', 'Sport', 'AWD', 'Crossover'] },
  },
  'SX4 S-Cross': {
    2013: { end: 2021, trims: ['SZ3', 'SZ4', 'SZ5', 'SZ-T', 'AllGrip'] }, // 1st gen
    2022: { end: 2026, trims: ['Motion', 'Ultra', 'Hybrid', 'AllGrip'] }, // facelift / Maruti S-Cross
  },
  Ignis: {
    2000: { end: 2008, trims: ['GL', 'GLX', 'Sport'] }, // 1st gen
    2016: { end: 2026, trims: ['SZ3', 'SZ-T', 'SZ5', 'AllGrip', 'Hybrid'] }, // 2nd gen
  },
  Baleno: {
    1995: { end: 2002, trims: ['GL', 'GLX', 'GTX'] }, // 1st gen (Esteem in US)
    2015: { end: 2026, trims: ['SZ3', 'SZ5', 'Sigma', 'Delta', 'Zeta', 'Alpha'] }, // 2nd gen (mostly India/EU)
  },
  Alto: {
    1994: { end: 2026, trims: ['GA', 'GL', 'GLX', 'LXi', 'VXi', 'K10'] }, // continuous India/Japan/EU
  },
  Celerio: {
    2014: { end: 2026, trims: ['SZ2', 'SZ3', 'SZ4', 'LXi', 'VXi', 'ZXi'] },
  },
  'Wagon R': {
    1997: { end: 2026, trims: ['LXi', 'VXi', 'ZXi', 'K10', 'Stingray'] }, // Maruti/JDM
  },
  Liana: {
    2001: { end: 2007, trims: ['GL', 'GLX', 'EX', 'Aerio'] }, // Aerio in US
  },
  Splash: {
    2008: { end: 2014, trims: ['SZ2', 'SZ3', 'SZ4', 'GLS'] }, // Opel Agila B twin
  },
  Esteem: {
    1995: { end: 2002, trims: ['GL', 'GLX', 'Sedan', 'Wagon'] }, // US name for Baleno
  },
  Aerio: {
    2002: { end: 2007, trims: ['Base', 'GS', 'SX'] }, // US name for Liana
  },
  Sidekick: {
    1989: { end: 1998, trims: ['JS', 'JX', 'JLX', 'Sport'] }, // US name for Vitara 1st gen (Geo Tracker twin)
  },
  Samurai: {
    1989: { end: 1995, trims: ['JA', 'JL', 'JX', 'Convertible'] }, // SJ413
  },
  XL7: {
    2001: { end: 2009, trims: ['Base', 'Plus', 'Premium', 'Limited'] }, // 1st gen (Grand Vitara stretched)
  },
  Reno: {
    2005: { end: 2008, trims: ['S', 'LX', 'EX'] }, // Daewoo Lacetti rebadge for US
  },
  Forenza: {
    2004: { end: 2008, trims: ['S', 'LX', 'EX'] }, // Daewoo Lacetti sedan rebadge
  },
  Verona: {
    2004: { end: 2006, trims: ['S', 'LX', 'EX'] }, // Daewoo Magnus rebadge
  },
  Kizashi: {
    2010: { end: 2013, trims: ['S', 'SE', 'GTS', 'SLS', 'Sport'] }, // mid-size sedan, final US release
  },
  Equator: {
    2009: { end: 2012, trims: ['Extended Cab', 'Crew Cab', 'Sport'] }, // Nissan Frontier rebadge
  },
  Across: {
    2020: { end: 2026, trims: ['Plug-in Hybrid'] }, // Toyota RAV4 PHEV rebadge for EU
  },
  Swace: {
    2020: { end: 2026, trims: ['SZ-T', 'SZ5', 'Hybrid'] }, // Toyota Corolla Touring Sport rebadge for EU
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Suzuki) ymmt[yearStr].Suzuki = {};
  if (!ymmt[yearStr].Suzuki[model]) {
    ymmt[yearStr].Suzuki[model] = trims;
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
  if (ymmt[year].Suzuki) {
    const sorted = {};
    Object.keys(ymmt[year].Suzuki).sort().forEach(m => { sorted[m] = ymmt[year].Suzuki[m]; });
    ymmt[year].Suzuki = sorted;
  }
});

Object.keys(ymmt).forEach(year => {
  const sortedMakes = {};
  Object.keys(ymmt[year]).sort().forEach(m => { sortedMakes[m] = ymmt[year][m]; });
  ymmt[year] = sortedMakes;
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Added ${addedCount} Suzuki year/model combinations`);
console.log('\nBreakdown by model:');
for (const [m, c] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${m.padEnd(16)} ${c} years`);
}
