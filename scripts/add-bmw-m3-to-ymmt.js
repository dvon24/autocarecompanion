const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW M3 coverage: 2001-2006, 2008-2013, 2015-2018, 2021-2023
// E46 (2001-2006): Coupe/Convertible, S54 engine
// E90/E92/E93 (2008-2013): Sedan/Coupe/Convertible, S65 V8 engine
// F80 (2015-2018): Sedan, S55 engine
// G80 (2021-2023): Sedan/Competition/Competition xDrive, S58 engine

const trims = {
  '2001-2006': ['Coupe', 'Convertible'], // E46
  '2008-2013': ['Sedan', 'Coupe', 'Convertible'], // E90/E92/E93
  '2015-2018': ['Sedan'], // F80
  '2021-2023': ['Sedan', 'Competition', 'Competition xDrive'] // G80
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

// E46 M3 (2001-2006)
console.log('\nAdding BMW M3 E46 (2001-2006)...');
for (let year = 2001; year <= 2006; year++) {
  if (addModelToYear(year.toString(), 'M3', trims['2001-2006'])) {
    console.log(`  Added ${year} M3`);
    addedCount++;
  }
}

// E90/E92/E93 M3 (2008-2013)
console.log('\nAdding BMW M3 E90/E92/E93 (2008-2013)...');
for (let year = 2008; year <= 2013; year++) {
  if (addModelToYear(year.toString(), 'M3', trims['2008-2013'])) {
    console.log(`  Added ${year} M3`);
    addedCount++;
  }
}

// F80 M3 (2015-2018)
console.log('\nAdding BMW M3 F80 (2015-2018)...');
for (let year = 2015; year <= 2018; year++) {
  if (addModelToYear(year.toString(), 'M3', trims['2015-2018'])) {
    console.log(`  Added ${year} M3`);
    addedCount++;
  }
}

// G80 M3 (2021-2023)
console.log('\nAdding BMW M3 G80 (2021-2023)...');
for (let year = 2021; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'M3', trims['2021-2023'])) {
    console.log(`  Added ${year} M3`);
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

console.log(`\n✓ Successfully added ${addedCount} BMW M3 year/model combinations`);
