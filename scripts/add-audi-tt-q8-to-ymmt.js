const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Audi TT (2008-2023, two generations: Mk2, Mk3)
const ttTrims = {
  '2008-2015': ['2.0T', 'TTS', 'TT RS'], // Mk2
  '2016-2023': ['2.0T', 'TTS', 'TT RS'] // Mk3
};

// Audi Q8 (2019-2023)
const q8Trims = {
  '2019-2023': ['Premium Plus', 'Prestige', 'S line', 'SQ8']
};

function addModelToYear(year, model, trims) {
  if (!ymmt[year]) {
    ymmt[year] = {};
  }
  if (!ymmt[year].Audi) {
    ymmt[year].Audi = {};
  }
  if (!ymmt[year].Audi[model]) {
    ymmt[year].Audi[model] = trims;
    return true;
  }
  return false;
}

let addedCount = 0;

// Add TT
console.log('\nAdding Audi TT...');
for (let year = 2008; year <= 2023; year++) {
  let trims = year <= 2015 ? ttTrims['2008-2015'] : ttTrims['2016-2023'];

  if (addModelToYear(year.toString(), 'TT', trims)) {
    console.log(`  Added ${year} TT`);
    addedCount++;
  }
}

// Add Q8
console.log('\nAdding Audi Q8...');
for (let year = 2019; year <= 2023; year++) {
  let trims = q8Trims['2019-2023'];

  if (addModelToYear(year.toString(), 'Q8', trims)) {
    console.log(`  Added ${year} Q8`);
    addedCount++;
  }
}

// Sort Audi models alphabetically for each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Audi) {
    const sortedAudi = {};
    Object.keys(ymmt[year].Audi).sort().forEach(model => {
      sortedAudi[model] = ymmt[year].Audi[model];
    });
    ymmt[year].Audi = sortedAudi;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Successfully added ${addedCount} Audi TT + Q8 year/model combinations`);
