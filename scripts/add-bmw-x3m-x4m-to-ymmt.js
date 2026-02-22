const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW X3 M (F97): 2020-2023 (Competition only trim)
// BMW X4 M (F98): 2020-2023 (Competition only trim)

const trims = {
  'X3 M': ['Competition'],
  'X4 M': ['Competition']
};

function addModelToYear(year, model, trimList) {
  if (!ymmt[year]) {
    ymmt[year] = {};
  }
  if (!ymmt[year].BMW) {
    ymmt[year].BMW = {};
  }
  if (!ymmt[year].BMW[model]) {
    ymmt[year].BMW[model] = trimList;
    return true;
  }
  return false;
}

let addedCount = 0;

// X3 M (2020-2023)
console.log('\nAdding BMW X3 M F97 (2020-2023)...');
for (let year = 2020; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'X3 M', trims['X3 M'])) {
    console.log(`  Added ${year} X3 M`);
    addedCount++;
  }
}

// X4 M (2020-2023)
console.log('\nAdding BMW X4 M F98 (2020-2023)...');
for (let year = 2020; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'X4 M', trims['X4 M'])) {
    console.log(`  Added ${year} X4 M`);
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

console.log(`\nSuccessfully added ${addedCount} BMW X3 M / X4 M year/model combinations`);
