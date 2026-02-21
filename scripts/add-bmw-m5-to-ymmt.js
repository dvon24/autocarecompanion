const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW M5 coverage: 2006-2023 (E60, F10, F90 generations)
// E60 M5: 2006-2010 (SMG or 6-speed manual)
// F10 M5: 2012-2016 (DCT only)
// F90 M5: 2018-2023 (DCT only)

const trims = {
  '2006-2010': ['SMG', '6-Speed Manual'], // E60
  '2012-2016': ['DCT'], // F10
  '2018-2023': ['DCT', 'Competition'] // F90
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

// E60 M5 (2006-2010)
console.log('\nAdding BMW M5 E60 (2006-2010)...');
for (let year = 2006; year <= 2010; year++) {
  if (addModelToYear(year.toString(), 'M5', trims['2006-2010'])) {
    console.log(`  Added ${year} M5`);
    addedCount++;
  }
}

// F10 M5 (2012-2016)
console.log('\nAdding BMW M5 F10 (2012-2016)...');
for (let year = 2012; year <= 2016; year++) {
  if (addModelToYear(year.toString(), 'M5', trims['2012-2016'])) {
    console.log(`  Added ${year} M5`);
    addedCount++;
  }
}

// F90 M5 (2018-2023)
console.log('\nAdding BMW M5 F90 (2018-2023)...');
for (let year = 2018; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'M5', trims['2018-2023'])) {
    console.log(`  Added ${year} M5`);
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

console.log(`\n✓ Successfully added ${addedCount} BMW M5 year/model combinations`);
