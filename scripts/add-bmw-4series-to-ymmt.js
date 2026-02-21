const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW 4 Series coverage: 2014-2023
// F32/F33/F36 (2014-2020): Coupe/Convertible/Gran Coupe
// G22/G23/G26 (2021-2023): Coupe/Convertible/Gran Coupe

const trims = {
  '2014-2015': ['428i', '428i xDrive', '435i', '435i xDrive'],
  '2016': ['428i', '428i xDrive', '435i', '435i xDrive'],
  '2017-2020': ['430i', '430i xDrive', '440i', '440i xDrive'],
  '2021-2023': ['430i', '430i xDrive', 'M440i xDrive']
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

// F32/F33/F36 generation (2014-2015)
console.log('\nAdding BMW 4 Series F32/F33/F36 (2014-2015)...');
for (let year = 2014; year <= 2015; year++) {
  if (addModelToYear(year.toString(), '4 Series', trims['2014-2015'])) {
    console.log(`  Added ${year} 4 Series`);
    addedCount++;
  }
}

// F32/F33/F36 generation (2016)
console.log('\nAdding BMW 4 Series F32/F33/F36 (2016)...');
if (addModelToYear('2016', '4 Series', trims['2016'])) {
  console.log('  Added 2016 4 Series');
  addedCount++;
}

// F32/F33/F36 generation (2017-2020)
console.log('\nAdding BMW 4 Series F32/F33/F36 (2017-2020)...');
for (let year = 2017; year <= 2020; year++) {
  if (addModelToYear(year.toString(), '4 Series', trims['2017-2020'])) {
    console.log(`  Added ${year} 4 Series`);
    addedCount++;
  }
}

// G22/G23/G26 generation (2021-2023)
console.log('\nAdding BMW 4 Series G22/G23/G26 (2021-2023)...');
for (let year = 2021; year <= 2023; year++) {
  if (addModelToYear(year.toString(), '4 Series', trims['2021-2023'])) {
    console.log(`  Added ${year} 4 Series`);
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

console.log(`\n✓ Successfully added ${addedCount} BMW 4 Series year/model combinations`);
