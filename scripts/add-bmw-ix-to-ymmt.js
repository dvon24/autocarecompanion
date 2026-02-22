const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW iX (I20) coverage: 2022-2025
// xDrive40, xDrive50, M60

const trims = {
  '2022-2023': ['xDrive40', 'xDrive50', 'M60'],
  '2024-2025': ['xDrive40', 'xDrive50', 'M60']
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

// I20 (2022-2025)
console.log('\nAdding BMW iX I20 (2022-2025)...');
for (let year = 2022; year <= 2025; year++) {
  if (addModelToYear(year.toString(), 'iX', trims['2022-2023'])) {
    console.log(`  Added ${year} iX`);
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

console.log(`\nSuccessfully added ${addedCount} BMW iX year/model combinations`);
