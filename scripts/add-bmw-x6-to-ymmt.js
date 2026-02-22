const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW X6 coverage: 2008-2023
// E71 (2008-2014): xDrive35i, xDrive50i
// F16 (2015-2019): xDrive35i, xDrive50i
// G06 (2020-2023): xDrive40i, M50i

// BMW X6 M coverage: 2010-2023
// E71 (2010-2014): X6 M
// F16 (2015-2019): X6 M
// G06 (2020-2023): X6 M

const x6Trims = {
  '2008-2014': ['xDrive35i', 'xDrive50i'], // E71
  '2015-2019': ['xDrive35i', 'xDrive50i'], // F16
  '2020-2023': ['xDrive40i', 'M50i'] // G06
};

const x6mTrims = {
  '2010-2014': ['X6 M'], // E71
  '2015-2019': ['X6 M'], // F16
  '2020-2023': ['X6 M'] // G06
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

// X6 E71 generation (2008-2014)
console.log('\nAdding BMW X6 E71 (2008-2014)...');
for (let year = 2008; year <= 2014; year++) {
  if (addModelToYear(year.toString(), 'X6', x6Trims['2008-2014'])) {
    console.log(`  Added ${year} X6`);
    addedCount++;
  }
}

// X6 F16 generation (2015-2019)
console.log('\nAdding BMW X6 F16 (2015-2019)...');
for (let year = 2015; year <= 2019; year++) {
  if (addModelToYear(year.toString(), 'X6', x6Trims['2015-2019'])) {
    console.log(`  Added ${year} X6`);
    addedCount++;
  }
}

// X6 G06 generation (2020-2023)
console.log('\nAdding BMW X6 G06 (2020-2023)...');
for (let year = 2020; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'X6', x6Trims['2020-2023'])) {
    console.log(`  Added ${year} X6`);
    addedCount++;
  }
}

// X6 M E71 generation (2010-2014)
console.log('\nAdding BMW X6 M E71 (2010-2014)...');
for (let year = 2010; year <= 2014; year++) {
  if (addModelToYear(year.toString(), 'X6 M', x6mTrims['2010-2014'])) {
    console.log(`  Added ${year} X6 M`);
    addedCount++;
  }
}

// X6 M F16 generation (2015-2019)
console.log('\nAdding BMW X6 M F16 (2015-2019)...');
for (let year = 2015; year <= 2019; year++) {
  if (addModelToYear(year.toString(), 'X6 M', x6mTrims['2015-2019'])) {
    console.log(`  Added ${year} X6 M`);
    addedCount++;
  }
}

// X6 M G06 generation (2020-2023)
console.log('\nAdding BMW X6 M G06 (2020-2023)...');
for (let year = 2020; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'X6 M', x6mTrims['2020-2023'])) {
    console.log(`  Added ${year} X6 M`);
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

console.log(`\n\u2713 Successfully added ${addedCount} BMW X6/X6 M year/model combinations`);
