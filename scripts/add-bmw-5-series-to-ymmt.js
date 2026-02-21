const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW 5 Series coverage: 2004-2023 (E60, F10, G30 generations)
// E60: 2004-2010 (525i, 528i, 530i, 535i, 545i, 550i)
// F10: 2011-2016 (528i, 535i, 550i)
// G30: 2017-2023 (530i, 540i, M550i)

const trims = {
  '2004-2010': ['525i', '528i', '530i', '535i', '545i', '550i'], // E60
  '2011-2016': ['528i', '535i', '550i'], // F10
  '2017-2023': ['530i', '540i', 'M550i'] // G30
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

// E60 generation (2004-2010)
console.log('\nAdding BMW 5 Series E60 (2004-2010)...');
for (let year = 2004; year <= 2010; year++) {
  if (addModelToYear(year.toString(), '5 Series', trims['2004-2010'])) {
    console.log(`  Added ${year} 5 Series`);
    addedCount++;
  }
}

// F10 generation (2011-2016)
console.log('\nAdding BMW 5 Series F10 (2011-2016)...');
for (let year = 2011; year <= 2016; year++) {
  if (addModelToYear(year.toString(), '5 Series', trims['2011-2016'])) {
    console.log(`  Added ${year} 5 Series`);
    addedCount++;
  }
}

// G30 generation (2017-2023)
console.log('\nAdding BMW 5 Series G30 (2017-2023)...');
for (let year = 2017; year <= 2023; year++) {
  if (addModelToYear(year.toString(), '5 Series', trims['2017-2023'])) {
    console.log(`  Added ${year} 5 Series`);
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

console.log(`\n✓ Successfully added ${addedCount} BMW 5 Series year/model combinations`);
