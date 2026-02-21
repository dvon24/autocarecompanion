const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW X4 coverage: 2015-2023
// F26 (2015-2018): xDrive28i, xDrive35i
// G02 (2019-2023): xDrive30i, M40i

const trims = {
  '2015-2018': ['xDrive28i', 'xDrive35i', 'M40i'], // F26
  '2019-2023': ['xDrive30i', 'M40i'] // G02
};

function addModelToYear(year, model, trims) {
  if (!ymmt[year]) {
    ymmt[year] = {};
  }
  if (!ymmt[year].BMW) {
    ymmt[year].BMW = {};
  }
  if (!ymmt[year].BMW[model]) {
    ymmt[year].BMW[model] = trims;
    return true;
  }
  return false;
}

let addedCount = 0;

// F26 generation (2015-2018)
console.log('\nAdding BMW X4 F26 (2015-2018)...');
for (let year = 2015; year <= 2018; year++) {
  if (addModelToYear(year.toString(), 'X4', trims['2015-2018'])) {
    console.log(`  Added ${year} X4`);
    addedCount++;
  }
}

// G02 generation (2019-2023)
console.log('\nAdding BMW X4 G02 (2019-2023)...');
for (let year = 2019; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'X4', trims['2019-2023'])) {
    console.log(`  Added ${year} X4`);
    addedCount++;
  }
}

// Sort BMW models alphabetically for each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].BMW) {
    const sortedBMW = {};
    Object.keys(ymmt[year].BMW).sort().forEach(model => {
      sortedBMW[model] = ymmt[year].BMW[model];
    });
    ymmt[year].BMW = sortedBMW;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Successfully added ${addedCount} BMW X4 year/model combinations`);
