const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW 3 Series coverage: 2006-2023 (E90, F30, G20 generations)
// E90: 2006-2011 (325i, 328i, 330i, 335i)
// F30: 2012-2019 (320i, 328i, 330i, 335i, 340i)
// G20: 2019-2023 (330i, M340i)

const trims = {
  '2006-2011': ['325i', '328i', '330i', '335i', '335d'], // E90
  '2012-2019': ['320i', '328i', '330i', '335i', '340i'], // F30
  '2019-2023': ['330i', 'M340i'] // G20
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

// E90 generation (2006-2011)
console.log('\nAdding BMW 3 Series E90 (2006-2011)...');
for (let year = 2006; year <= 2011; year++) {
  if (addModelToYear(year.toString(), '3 Series', trims['2006-2011'])) {
    console.log(`  Added ${year} 3 Series`);
    addedCount++;
  }
}

// F30 generation (2012-2019)
console.log('\nAdding BMW 3 Series F30 (2012-2019)...');
for (let year = 2012; year <= 2019; year++) {
  if (addModelToYear(year.toString(), '3 Series', trims['2012-2019'])) {
    console.log(`  Added ${year} 3 Series`);
    addedCount++;
  }
}

// G20 generation (2019-2023)
console.log('\nAdding BMW 3 Series G20 (2019-2023)...');
for (let year = 2019; year <= 2023; year++) {
  if (addModelToYear(year.toString(), '3 Series', trims['2019-2023'])) {
    console.log(`  Added ${year} 3 Series`);
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

console.log(`\n✓ Successfully added ${addedCount} BMW 3 Series year/model combinations`);
