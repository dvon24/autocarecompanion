const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW X3 coverage: 2004-2023 (E83, F25, G01 generations)
// E83: 2004-2010 (2.5i, 3.0i, 3.0si)
// F25: 2011-2017 (xDrive28i, xDrive35i)
// G01: 2018-2023 (sDrive30i, xDrive30i, M40i)

const trims = {
  '2004-2010': ['2.5i', '3.0i', '3.0si'], // E83
  '2011-2017': ['xDrive28i', 'xDrive35i'], // F25
  '2018-2023': ['sDrive30i', 'xDrive30i', 'M40i'] // G01
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

// E83 generation (2004-2010)
console.log('\nAdding BMW X3 E83 (2004-2010)...');
for (let year = 2004; year <= 2010; year++) {
  if (addModelToYear(year.toString(), 'X3', trims['2004-2010'])) {
    console.log(`  Added ${year} X3`);
    addedCount++;
  }
}

// F25 generation (2011-2017)
console.log('\nAdding BMW X3 F25 (2011-2017)...');
for (let year = 2011; year <= 2017; year++) {
  if (addModelToYear(year.toString(), 'X3', trims['2011-2017'])) {
    console.log(`  Added ${year} X3`);
    addedCount++;
  }
}

// G01 generation (2018-2023)
console.log('\nAdding BMW X3 G01 (2018-2023)...');
for (let year = 2018; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'X3', trims['2018-2023'])) {
    console.log(`  Added ${year} X3`);
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

console.log(`\n✓ Successfully added ${addedCount} BMW X3 year/model combinations`);
