const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW Z4 coverage: 2003-2025 (E85, E89, G29 generations)
// E85: 2003-2008 (2.5i, 3.0i, 3.0si, M Roadster)
// E89: 2009-2016 (sDrive28i, sDrive30i, sDrive35i, sDrive35is)
// G29: 2019-2025 (sDrive30i, M40i)

const trims = {
  '2003-2005': ['2.5i', '3.0i'],                         // E85 early
  '2006-2008': ['3.0i', '3.0si', 'M Roadster'],          // E85 facelift
  '2009-2011': ['sDrive30i', 'sDrive35i', 'sDrive35is'], // E89 early
  '2012-2016': ['sDrive28i', 'sDrive35i', 'sDrive35is'], // E89 LCI
  '2019-2025': ['sDrive30i', 'M40i']                      // G29
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

// E85 early (2003-2005)
console.log('\nAdding BMW Z4 E85 early (2003-2005)...');
for (let year = 2003; year <= 2005; year++) {
  if (addModelToYear(year.toString(), 'Z4', trims['2003-2005'])) {
    console.log(`  Added ${year} Z4`);
    addedCount++;
  }
}

// E85 facelift (2006-2008)
console.log('\nAdding BMW Z4 E85 facelift (2006-2008)...');
for (let year = 2006; year <= 2008; year++) {
  if (addModelToYear(year.toString(), 'Z4', trims['2006-2008'])) {
    console.log(`  Added ${year} Z4`);
    addedCount++;
  }
}

// E89 early (2009-2011)
console.log('\nAdding BMW Z4 E89 early (2009-2011)...');
for (let year = 2009; year <= 2011; year++) {
  if (addModelToYear(year.toString(), 'Z4', trims['2009-2011'])) {
    console.log(`  Added ${year} Z4`);
    addedCount++;
  }
}

// E89 LCI (2012-2016)
console.log('\nAdding BMW Z4 E89 LCI (2012-2016)...');
for (let year = 2012; year <= 2016; year++) {
  if (addModelToYear(year.toString(), 'Z4', trims['2012-2016'])) {
    console.log(`  Added ${year} Z4`);
    addedCount++;
  }
}

// G29 (2019-2025)
console.log('\nAdding BMW Z4 G29 (2019-2025)...');
for (let year = 2019; year <= 2025; year++) {
  if (addModelToYear(year.toString(), 'Z4', trims['2019-2025'])) {
    console.log(`  Added ${year} Z4`);
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

console.log(`\nSuccessfully added ${addedCount} BMW Z4 year/model combinations`);
