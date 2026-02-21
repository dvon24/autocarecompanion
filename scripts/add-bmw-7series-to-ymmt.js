const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW 7 Series coverage: 2002-2023
// E65/E66 (2002-2008): 745i, 750i, 760i
// F01/F02 (2009-2015): 740i, 750i, 750Li, ActiveHybrid 7
// G11/G12 (2016-2023): 740i, 750i, 750i xDrive, M760i

const trims = {
  '2002-2008': ['745i', '745Li', '750i', '750Li', '760i', '760Li'], // E65/E66
  '2009-2015': ['740i', '740Li', '750i', '750Li', '750i xDrive', '750Li xDrive', 'ActiveHybrid 7', '760Li'], // F01/F02
  '2016-2023': ['740i', '740i xDrive', '740e xDrive', '745e xDrive', '750i xDrive', 'M760i xDrive'] // G11/G12
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

// E65/E66 generation (2002-2008)
console.log('\nAdding BMW 7 Series E65/E66 (2002-2008)...');
for (let year = 2002; year <= 2008; year++) {
  if (addModelToYear(year.toString(), '7 Series', trims['2002-2008'])) {
    console.log(`  Added ${year} 7 Series`);
    addedCount++;
  }
}

// F01/F02 generation (2009-2015)
console.log('\nAdding BMW 7 Series F01/F02 (2009-2015)...');
for (let year = 2009; year <= 2015; year++) {
  if (addModelToYear(year.toString(), '7 Series', trims['2009-2015'])) {
    console.log(`  Added ${year} 7 Series`);
    addedCount++;
  }
}

// G11/G12 generation (2016-2023)
console.log('\nAdding BMW 7 Series G11/G12 (2016-2023)...');
for (let year = 2016; year <= 2023; year++) {
  if (addModelToYear(year.toString(), '7 Series', trims['2016-2023'])) {
    console.log(`  Added ${year} 7 Series`);
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

console.log(`\n✓ Successfully added ${addedCount} BMW 7 Series year/model combinations`);
