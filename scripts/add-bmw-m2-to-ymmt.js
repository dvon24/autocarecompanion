const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW M2 coverage: 2016-2020, 2023
// F87 M2 (2016-2018): Base model with N55 engine
// F87 M2 Competition (2019-2020): S55 engine
// G87 M2 (2023+): S58 engine

const trims = {
  '2016-2018': ['Base', 'Manual', 'DCT'], // F87 M2
  '2019-2020': ['Competition'], // F87 M2 Competition
  '2023': ['Base', 'Manual', 'DCT'] // G87 M2
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

// F87 M2 (2016-2018)
console.log('\nAdding BMW M2 F87 (2016-2018)...');
for (let year = 2016; year <= 2018; year++) {
  if (addModelToYear(year.toString(), 'M2', trims['2016-2018'])) {
    console.log(`  Added ${year} M2`);
    addedCount++;
  }
}

// F87 M2 Competition (2019-2020)
console.log('\nAdding BMW M2 Competition F87 (2019-2020)...');
for (let year = 2019; year <= 2020; year++) {
  if (addModelToYear(year.toString(), 'M2', trims['2019-2020'])) {
    console.log(`  Added ${year} M2`);
    addedCount++;
  }
}

// G87 M2 (2023+)
console.log('\nAdding BMW M2 G87 (2023)...');
if (addModelToYear('2023', 'M2', trims['2023'])) {
  console.log('  Added 2023 M2');
  addedCount++;
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

console.log(`\n✓ Successfully added ${addedCount} BMW M2 year/model combinations`);
