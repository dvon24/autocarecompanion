const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW M4 coverage: 2015-2023
// F82/F83 (2015-2020): Coupe/Convertible, S55 engine
// G82/G83 (2021-2023): Coupe/Convertible, S58 engine

const trims = {
  '2015-2020': ['Base', 'Competition', 'CS', 'GTS'], // F82/F83
  '2021-2023': ['Base', 'Competition', 'xDrive'] // G82/G83
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

// F82/F83 M4 (2015-2020)
console.log('\nAdding BMW M4 F82/F83 (2015-2020)...');
for (let year = 2015; year <= 2020; year++) {
  if (addModelToYear(year.toString(), 'M4', trims['2015-2020'])) {
    console.log(`  Added ${year} M4`);
    addedCount++;
  }
}

// G82/G83 M4 (2021-2023)
console.log('\nAdding BMW M4 G82/G83 (2021-2023)...');
for (let year = 2021; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'M4', trims['2021-2023'])) {
    console.log(`  Added ${year} M4`);
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

console.log(`\n✓ Successfully added ${addedCount} BMW M4 year/model combinations`);
