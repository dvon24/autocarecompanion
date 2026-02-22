const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW X2 coverage: 2018-2023
// F39 (2018-2023): sDrive28i, xDrive28i, M35i

const trims = {
  '2018-2023': ['sDrive28i', 'xDrive28i', 'M35i'] // F39
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

// F39 generation (2018-2023)
console.log('\nAdding BMW X2 F39 (2018-2023)...');
for (let year = 2018; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'X2', trims['2018-2023'])) {
    console.log(`  Added ${year} X2`);
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

console.log(`\n\u2713 Successfully added ${addedCount} BMW X2 year/model combinations`);
