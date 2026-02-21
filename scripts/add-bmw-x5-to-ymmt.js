const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW X5 coverage: 2000-2023 (E53, E70, F15, G05 generations)
// E53: 2000-2006 (3.0i, 4.4i, 4.6is, 4.8is)
// E70: 2007-2013 (xDrive30i, xDrive35i, xDrive48i, xDrive50i)
// F15: 2014-2018 (xDrive35i, xDrive50i)
// G05: 2019-2023 (sDrive40i, xDrive40i, xDrive50i, M50i)

const trims = {
  '2000-2006': ['3.0i', '4.4i', '4.6is', '4.8is'], // E53
  '2007-2013': ['xDrive30i', 'xDrive35i', 'xDrive48i', 'xDrive50i'], // E70
  '2014-2018': ['xDrive35i', 'xDrive50i'], // F15
  '2019-2023': ['sDrive40i', 'xDrive40i', 'xDrive50i', 'M50i'] // G05
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

// E53 generation (2000-2006)
console.log('\nAdding BMW X5 E53 (2000-2006)...');
for (let year = 2000; year <= 2006; year++) {
  if (addModelToYear(year.toString(), 'X5', trims['2000-2006'])) {
    console.log(`  Added ${year} X5`);
    addedCount++;
  }
}

// E70 generation (2007-2013)
console.log('\nAdding BMW X5 E70 (2007-2013)...');
for (let year = 2007; year <= 2013; year++) {
  if (addModelToYear(year.toString(), 'X5', trims['2007-2013'])) {
    console.log(`  Added ${year} X5`);
    addedCount++;
  }
}

// F15 generation (2014-2018)
console.log('\nAdding BMW X5 F15 (2014-2018)...');
for (let year = 2014; year <= 2018; year++) {
  if (addModelToYear(year.toString(), 'X5', trims['2014-2018'])) {
    console.log(`  Added ${year} X5`);
    addedCount++;
  }
}

// G05 generation (2019-2023)
console.log('\nAdding BMW X5 G05 (2019-2023)...');
for (let year = 2019; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'X5', trims['2019-2023'])) {
    console.log(`  Added ${year} X5`);
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

console.log(`\n✓ Successfully added ${addedCount} BMW X5 year/model combinations`);
