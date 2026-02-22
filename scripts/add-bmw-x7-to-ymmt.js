const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW X7 coverage: 2019-2023
// G07 (2019-2023): xDrive40i, xDrive50i, M50i

const trims = {
  '2019-2023': ['xDrive40i', 'xDrive50i', 'M50i'] // G07
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

// G07 generation (2019-2023)
console.log('\nAdding BMW X7 G07 (2019-2023)...');
for (let year = 2019; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'X7', trims['2019-2023'])) {
    console.log(`  Added ${year} X7`);
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

console.log(`\n\u2713 Successfully added ${addedCount} BMW X7 year/model combinations`);
