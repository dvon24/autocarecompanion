const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW 2 Series coverage: 2014-2023
// F22/F23 (2014-2021): 228i, 230i, M240i (Coupe/Convertible)
// G42 (2022-2023): 230i, M240i (Coupe only)

const trims = {
  '2014-2016': ['228i', '228i xDrive'], // F22/F23 N20 engine
  '2017-2021': ['230i', '230i xDrive', 'M240i', 'M240i xDrive'], // F22/F23 B46/B48
  '2022-2023': ['230i', 'M240i xDrive'] // G42
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

// F22/F23 generation (2014-2016) N20
console.log('\nAdding BMW 2 Series F22/F23 (2014-2016)...');
for (let year = 2014; year <= 2016; year++) {
  if (addModelToYear(year.toString(), '2 Series', trims['2014-2016'])) {
    console.log(`  Added ${year} 2 Series`);
    addedCount++;
  }
}

// F22/F23 generation (2017-2021) B46/B48
console.log('\nAdding BMW 2 Series F22/F23 (2017-2021)...');
for (let year = 2017; year <= 2021; year++) {
  if (addModelToYear(year.toString(), '2 Series', trims['2017-2021'])) {
    console.log(`  Added ${year} 2 Series`);
    addedCount++;
  }
}

// G42 generation (2022-2023)
console.log('\nAdding BMW 2 Series G42 (2022-2023)...');
for (let year = 2022; year <= 2023; year++) {
  if (addModelToYear(year.toString(), '2 Series', trims['2022-2023'])) {
    console.log(`  Added ${year} 2 Series`);
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

console.log(`\n✓ Successfully added ${addedCount} BMW 2 Series year/model combinations`);
