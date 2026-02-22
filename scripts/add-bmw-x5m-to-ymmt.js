const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW X5 M coverage: 2010-2023 (E70, F85, F95 generations)
// E70 X5 M: 2010-2013 (S63 4.4L V8)
// F85 X5 M: 2015-2018 (S63TU 4.4L V8)
// F95 X5 M: 2020-2023 (S63TU2 4.4L V8, Competition available)

const trims = {
  '2010-2013': ['S63 4.4L V8'],           // E70
  '2015-2018': ['S63 4.4L V8'],           // F85
  '2020-2023': ['Competition']             // F95
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

// E70 X5 M (2010-2013)
console.log('\nAdding BMW X5 M E70 (2010-2013)...');
for (let year = 2010; year <= 2013; year++) {
  if (addModelToYear(year.toString(), 'X5 M', trims['2010-2013'])) {
    console.log(`  Added ${year} X5 M`);
    addedCount++;
  }
}

// F85 X5 M (2015-2018)
console.log('\nAdding BMW X5 M F85 (2015-2018)...');
for (let year = 2015; year <= 2018; year++) {
  if (addModelToYear(year.toString(), 'X5 M', trims['2015-2018'])) {
    console.log(`  Added ${year} X5 M`);
    addedCount++;
  }
}

// F95 X5 M (2020-2023)
console.log('\nAdding BMW X5 M F95 (2020-2023)...');
for (let year = 2020; year <= 2023; year++) {
  if (addModelToYear(year.toString(), 'X5 M', trims['2020-2023'])) {
    console.log(`  Added ${year} X5 M`);
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

console.log(`\nSuccessfully added ${addedCount} BMW X5 M year/model combinations`);
