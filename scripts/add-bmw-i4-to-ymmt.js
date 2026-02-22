const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW i4 (G26) coverage: 2022-2025
// eDrive35 (2024+), eDrive40, xDrive40 (2024+), M50 (2022-2024), M60 (2025+)

const trims = {
  '2022-2023': ['eDrive40', 'M50'],
  '2024': ['eDrive35', 'eDrive40', 'xDrive40', 'M50'],
  '2025': ['eDrive35', 'eDrive40', 'xDrive40', 'M60']
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

// G26 (2022-2023)
console.log('\nAdding BMW i4 G26 (2022-2023)...');
for (let year = 2022; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'i4', trims['2022-2023'])) {
    console.log(`  Added ${year} i4`);
    addedCount++;
  }
}

// G26 LCI (2024)
console.log('\nAdding BMW i4 G26 LCI (2024)...');
if (addModelToYear('2024', 'i4', trims['2024'])) {
  console.log(`  Added 2024 i4`);
  addedCount++;
}

// G26 LCI (2025)
console.log('\nAdding BMW i4 G26 LCI (2025)...');
if (addModelToYear('2025', 'i4', trims['2025'])) {
  console.log(`  Added 2025 i4`);
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

console.log(`\nSuccessfully added ${addedCount} BMW i4 year/model combinations`);
