/**
 * Add Peugeot, Renault, and Citroën to ymmt.json
 */
const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const frenchMakes = {
  Peugeot: {
    '206': { start: 2000, end: 2012, trims: ['XR', 'XT', 'GTi'] },
    '207': { start: 2006, end: 2014, trims: ['Active', 'Allure', 'GTi'] },
    '208': { start: 2012, end: 2026, trims: ['Active', 'Allure', 'GT', 'GT Line', 'e-208'] },
    '308': { start: 2007, end: 2026, trims: ['Active', 'Allure', 'GT', 'GT Line'] },
    '3008': { start: 2009, end: 2026, trims: ['Active', 'Allure', 'GT', 'GT Line'] },
    '5008': { start: 2009, end: 2026, trims: ['Active', 'Allure', 'GT'] },
    '508': { start: 2011, end: 2026, trims: ['Active', 'Allure', 'GT'] },
    '2008': { start: 2013, end: 2026, trims: ['Active', 'Allure', 'GT Line'] },
    'Partner/Rifter': { start: 2008, end: 2026, trims: ['Standard', 'Long'] },
    'RCZ': { start: 2010, end: 2015, trims: ['Base', 'GT Line', 'R'] },
  },
  Renault: {
    'Clio': { start: 2000, end: 2026, trims: ['Expression', 'Dynamique', 'RS', 'Iconic'] },
    'Megane': { start: 2003, end: 2023, trims: ['Expression', 'Dynamique', 'GT', 'RS'] },
    'Captur': { start: 2013, end: 2026, trims: ['Expression', 'Dynamique', 'Iconic'] },
    'Kadjar': { start: 2015, end: 2022, trims: ['Expression', 'Dynamique', 'Signature'] },
    'Scenic': { start: 2003, end: 2024, trims: ['Expression', 'Dynamique', 'Signature'] },
    'Koleos': { start: 2008, end: 2024, trims: ['Expression', 'Dynamique', 'Initiale Paris'] },
    'Zoe': { start: 2013, end: 2024, trims: ['Play', 'Iconic', 'GT Line'] },
    'Twizy': { start: 2012, end: 2020, trims: ['Base', 'Color'] },
    'Megane E-Tech': { start: 2022, end: 2026, trims: ['Equilibre', 'Techno', 'Iconic'] },
  },
  'Citro\u00ebn': {
    'C3': { start: 2002, end: 2026, trims: ['Live', 'Feel', 'Shine'] },
    'C4': { start: 2004, end: 2026, trims: ['Live', 'Feel', 'Shine'] },
    'C5 Aircross': { start: 2019, end: 2026, trims: ['Feel', 'Shine', 'Flair'] },
    'Berlingo': { start: 2008, end: 2026, trims: ['Feel', 'Flair', 'Flair XL'] },
    'C1': { start: 2005, end: 2022, trims: ['Touch', 'Feel', 'Flair'] },
    'DS3': { start: 2010, end: 2019, trims: ['DStyle', 'DSport', 'Performance'] },
    'C4 Cactus': { start: 2014, end: 2020, trims: ['Feel', 'Flair'] },
    'C5': { start: 2001, end: 2017, trims: ['VTR', 'VTX', 'Exclusive'] },
  }
};

let addedCount = 0;

for (const [make, models] of Object.entries(frenchMakes)) {
  for (const [model, info] of Object.entries(models)) {
    for (let year = info.start; year <= info.end; year++) {
      const y = String(year);
      if (!ymmt[y]) ymmt[y] = {};
      if (!ymmt[y][make]) ymmt[y][make] = {};
      if (!ymmt[y][make][model]) {
        ymmt[y][make][model] = info.trims;
        addedCount++;
      }
    }
  }
}

// Sort years numerically, makes alphabetically within each year
const sorted = {};
for (const year of Object.keys(ymmt).sort((a, b) => Number(a) - Number(b))) {
  sorted[year] = {};
  for (const make of Object.keys(ymmt[year]).sort()) {
    sorted[year][make] = ymmt[year][make];
  }
}

fs.writeFileSync(ymmtPath, JSON.stringify(sorted, null, 2) + '\n');
console.log(`Added ${addedCount} YMMT entries for French makes`);

// Summary
for (const make of ['Peugeot', 'Renault', 'Citro\u00ebn']) {
  let count = 0;
  for (const year of Object.keys(sorted)) {
    if (sorted[year][make]) count += Object.keys(sorted[year][make]).length;
  }
  console.log(`  ${make}: ${count} year/model entries`);
}
