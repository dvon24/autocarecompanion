#!/usr/bin/env node
/**
 * Add Opel to YMMT — German market launch.
 *
 * Opel is a German GM brand (acquired by Stellantis in 2017), one of
 * Germany's biggest domestic brands. Astra and Corsa are consistently
 * top-10 sellers in Germany. Models since 2017 share Stellantis (PSA)
 * platforms with Peugeot/Citroën/DS; pre-2017 share GM platforms with
 * Buick/Vauxhall (UK)/Holden (AU).
 *
 * Not sold in US since GM closed Saturn in 2009; some Opel-designed
 * cars came over as Buick (Regal/Cascada).
 */

const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const MODELS = {
  Astra: {
    1991: { end: 1998, trims: ['Base', 'GLS', 'CDX', 'Sport', 'Caravan'] }, // F
    1998: { end: 2004, trims: ['Club', 'CD', 'CDX', 'OPC', 'Caravan', 'Coupe', 'Cabrio'] }, // G
    2004: { end: 2010, trims: ['Selection', 'Edition', 'Cosmo', 'Sport', 'OPC', 'GTC', 'Caravan', 'TwinTop'] }, // H
    2009: { end: 2015, trims: ['Selection', 'Edition', 'Cosmo', 'Sport', 'OPC', 'Innovation', 'GTC', 'Sports Tourer'] }, // J
    2015: { end: 2021, trims: ['Selection', 'Edition', 'Dynamic', '120 Jahre', 'GS Line', 'Ultimate', 'Sports Tourer'] }, // K
    2021: { end: 2026, trims: ['Selection', 'Edition', 'Elegance', 'GS', 'Ultimate', 'Electric', 'Sports Tourer'] }, // L
  },
  Corsa: {
    1993: { end: 2000, trims: ['Base', 'Swing', 'GLS', 'GSi', 'Sport', '1.0', '1.4'] }, // B
    2000: { end: 2006, trims: ['Comfort', 'Elegance', 'Sport', 'GSi', '1.2', '1.4'] }, // C
    2006: { end: 2014, trims: ['Selection', 'Edition', 'Cosmo', 'OPC', 'Color Edition', 'GSi', '3-door', '5-door'] }, // D
    2014: { end: 2019, trims: ['Selection', 'Edition', 'Cosmo', 'OPC', 'Color Edition', '120 Jahre'] }, // E
    2019: { end: 2026, trims: ['Selection', 'Edition', 'Elegance', 'GS', 'Ultimate', 'Electric', 'Corsa-e'] }, // F (PSA platform)
  },
  Insignia: {
    2008: { end: 2017, trims: ['Edition', 'Cosmo', 'Sport', 'OPC', 'Country Tourer', 'Sports Tourer', 'Notchback'] }, // A
    2017: { end: 2022, trims: ['Selection', 'Edition', 'Innovation', 'Business', 'GSi', 'Ultimate', 'Country Tourer', 'Sports Tourer'] }, // B
  },
  Vectra: {
    1995: { end: 2002, trims: ['Base', 'GL', 'GLS', 'CDX', 'i500', 'Caravan'] }, // B
    2002: { end: 2009, trims: ['Comfort', 'Elegance', 'Sport', 'GTS', 'OPC', 'Signum', 'Caravan'] }, // C
  },
  Mokka: {
    2012: { end: 2019, trims: ['Selection', 'Edition', 'Innovation', 'Color Edition', 'Mokka X'] }, // Mokka X facelift 2016
    2020: { end: 2026, trims: ['Selection', 'Edition', 'Elegance', 'GS', 'Ultimate', 'Mokka-e'] }, // Stellantis-era
  },
  Crossland: {
    2017: { end: 2026, trims: ['Selection', 'Edition', 'Innovation', 'Elegance', 'GS Line', 'Ultimate'] },
  },
  Grandland: {
    2017: { end: 2023, trims: ['Selection', 'Edition', 'Innovation', 'Elegance', 'GS Line', 'Ultimate', 'Hybrid', 'Hybrid4'] }, // X
    2024: { end: 2026, trims: ['Edition', 'GS', 'Ultimate', 'Electric'] }, // 2nd gen on STLA Medium
  },
  Combo: {
    2001: { end: 2011, trims: ['Tour', 'Cargo', 'CDTI', 'C'] }, // C
    2011: { end: 2018, trims: ['Tour', 'Cargo', 'CDTI', 'D'] }, // D
    2018: { end: 2026, trims: ['Cargo', 'Life', 'Electric', 'Combo-e'] }, // E (PSA platform)
  },
  Vivaro: {
    2001: { end: 2014, trims: ['Combi', 'Tour', 'Cargo'] }, // A
    2014: { end: 2019, trims: ['Combi', 'Tour', 'Cargo', 'Sportive'] }, // B
    2019: { end: 2026, trims: ['Cargo', 'Doublecab', 'Combi', 'Electric', 'Vivaro-e'] }, // C
  },
  Movano: {
    1998: { end: 2010, trims: ['Box', 'Combi', 'Chassis Cab'] },
    2010: { end: 2021, trims: ['Box', 'Combi', 'Chassis Cab', 'Tipper'] },
    2021: { end: 2026, trims: ['Box', 'Combi', 'Chassis Cab', 'Electric', 'Movano-e'] }, // Stellantis-era
  },
  Zafira: {
    1999: { end: 2005, trims: ['Comfort', 'Elegance', 'Sport', 'GSi', 'CNG'] }, // A
    2005: { end: 2014, trims: ['Selection', 'Edition', 'Cosmo', 'Sport', 'OPC', 'CNG'] }, // B
    2011: { end: 2019, trims: ['Selection', 'Tourer', 'Edition', 'Cosmo', 'OPC Line'] }, // C (Zafira Tourer)
    2019: { end: 2024, trims: ['Edition', 'Elegance', 'Selection', 'Zafira Life'] }, // Life (rebadged Citroën SpaceTourer)
  },
  Meriva: {
    2003: { end: 2010, trims: ['Base', 'Enjoy', 'Cosmo', 'Sport', 'OPC'] }, // A
    2010: { end: 2017, trims: ['Selection', 'Edition', 'Cosmo', 'Color Edition'] }, // B
  },
  Antara: {
    2006: { end: 2017, trims: ['Selection', 'Edition', 'Cosmo', '4x4'] },
  },
  Adam: {
    2013: { end: 2019, trims: ['Jam', 'Slam', 'Glam', 'Rocks', 'S', 'Black Jack', 'White Link'] },
  },
  Karl: {
    2015: { end: 2019, trims: ['Selection', 'Edition', 'Cosmo', 'Rocks'] },
  },
  Ampera: {
    2011: { end: 2014, trims: ['Plug-in Hybrid'] }, // Chevy Volt twin
    2017: { end: 2020, trims: ['Ampera-e'] }, // Chevy Bolt twin
  },
  Agila: {
    2000: { end: 2007, trims: ['Comfort', 'Elegance', 'Sport'] }, // A (Suzuki Wagon R twin)
    2007: { end: 2014, trims: ['Selection', 'Edition', 'Enjoy', 'Cosmo'] }, // B (Suzuki Splash twin)
  },
  Tigra: {
    1994: { end: 2000, trims: ['Base', 'GLS', 'Sport'] }, // A (Corsa-based coupe)
    2004: { end: 2009, trims: ['Twin Top', 'Sport', 'Linea Rossa'] }, // B (roadster on Corsa C)
  },
  Calibra: {
    1989: { end: 1997, trims: ['Base', '4x4', '2.0i 16V', 'V6', 'Turbo 4x4'] },
  },
  Frontera: {
    1991: { end: 1998, trims: ['Sport', 'Long', '2.0i', '2.4i', '2.8 TDS'] }, // A (Isuzu MU twin)
    1998: { end: 2004, trims: ['Sport', 'Long', '3.2i V6', '2.2 DTI'] }, // B
  },
  Cascada: {
    2013: { end: 2019, trims: ['Edition', 'Cosmo', 'Innovation', 'Supreme'] }, // Buick Cascada in US
  },
  GT: {
    2007: { end: 2010, trims: ['Roadster'] }, // Saturn Sky twin (Kappa platform)
  },
  Speedster: {
    2001: { end: 2005, trims: ['2.2', 'Turbo'] }, // Lotus Elise-based
  },
  Manta: {
    1990: { end: 1991, trims: ['GSi', 'GT/E', 'Berlinetta'] }, // B final years
  },
};

function addModelToYear(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Opel) ymmt[yearStr].Opel = {};
  if (!ymmt[yearStr].Opel[model]) {
    ymmt[yearStr].Opel[model] = trims;
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

// Sort Opel models alphabetically for each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Opel) {
    const sorted = {};
    Object.keys(ymmt[year].Opel).sort().forEach(model => {
      sorted[model] = ymmt[year].Opel[model];
    });
    ymmt[year].Opel = sorted;
  }
});

// Re-sort makes for each year (so Opel sits alphabetically)
Object.keys(ymmt).forEach(year => {
  const sortedMakes = {};
  Object.keys(ymmt[year]).sort().forEach(make => {
    sortedMakes[make] = ymmt[year][make];
  });
  ymmt[year] = sortedMakes;
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Successfully added ${addedCount} Opel year/model combinations`);
console.log('\nBreakdown by model:');
for (const [model, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${model.padEnd(14)} ${count} years`);
}
