const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW 8 Series coverage: 2019-2024
// G14/G15/G16 (2019-2024): 840i, M850i

// BMW M8 coverage: 2020-2024
// F91/F92/F93 (2020-2024): M8, M8 Competition

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

// BMW 8 Series (2019-2024)
console.log('\nAdding BMW 8 Series (2019-2024)...');
for (let year = 2019; year <= 2024; year++) {
  if (addModelToYear(year.toString(), '8 Series', ['840i', 'M850i'])) {
    console.log(`  Added ${year} 8 Series`);
    addedCount++;
  }
}

// BMW M8 (2020-2024)
console.log('\nAdding BMW M8 (2020-2024)...');
for (let year = 2020; year <= 2024; year++) {
  if (addModelToYear(year.toString(), 'M8', ['M8', 'M8 Competition'])) {
    console.log(`  Added ${year} M8`);
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

console.log(`\n\u2713 Successfully added ${addedCount} BMW 8 Series/M8 year/model combinations`);
