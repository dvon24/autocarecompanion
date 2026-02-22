const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW i8 coverage:
// I12 Coupe (2014-2020): B38 1.5T + eDrive
// I15 Roadster (2019-2020): B38 1.5T + eDrive

const trims = {
  '2014-2018': ['Coupe'],
  '2019-2020': ['Coupe', 'Roadster']
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

// I12 Coupe only (2014-2018)
console.log('\nAdding BMW i8 I12 Coupe (2014-2018)...');
for (let year = 2014; year <= 2018; year++) {
  if (addModelToYear(year.toString(), 'i8', trims['2014-2018'])) {
    console.log(`  Added ${year} i8`);
    addedCount++;
  }
}

// I12 Coupe + I15 Roadster (2019-2020)
console.log('\nAdding BMW i8 I12 Coupe + I15 Roadster (2019-2020)...');
for (let year = 2019; year <= 2020; year++) {
  if (addModelToYear(year.toString(), 'i8', trims['2019-2020'])) {
    console.log(`  Added ${year} i8`);
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

console.log(`\nSuccessfully added ${addedCount} BMW i8 year/model combinations`);
