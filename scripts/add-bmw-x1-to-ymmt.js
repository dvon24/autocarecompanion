const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW X1 coverage: 2013-2023
// E84 (2013-2015): xDrive28i (N20)
// F48 (2016-2023): sDrive28i, xDrive28i (B46/B48)

const trims = {
  '2013-2015': ['xDrive28i'], // E84
  '2016-2023': ['sDrive28i', 'xDrive28i'] // F48
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

// E84 X1 (2013-2015)
console.log('\nAdding BMW X1 E84 (2013-2015)...');
for (let year = 2013; year <= 2015; year++) {
  if (addModelToYear(year.toString(), 'X1', trims['2013-2015'])) {
    console.log(`  Added ${year} X1`);
    addedCount++;
  }
}

// F48 X1 (2016-2023)
console.log('\nAdding BMW X1 F48 (2016-2023)...');
for (let year = 2016; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'X1', trims['2016-2023'])) {
    console.log(`  Added ${year} X1`);
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

console.log(`\n✓ Successfully added ${addedCount} BMW X1 year/model combinations`);
