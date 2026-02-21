const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Honda Insight (3 generations)
const insightTrims = {
  '2000-2006': ['Base', 'CVT'], // First gen
  '2010-2014': ['LX', 'EX', 'EX-L'], // Second gen
  '2019-2022': ['LX', 'EX', 'Touring'] // Third gen (discontinued 2022)
};

// Honda Crosstour
const crosstourTrims = {
  '2010-2015': ['EX', 'EX-L', 'EX-L V6']
};

function addModelToYear(year, model, trims) {
  if (!ymmt[year]) {
    ymmt[year] = {};
  }
  if (!ymmt[year].Honda) {
    ymmt[year].Honda = {};
  }
  if (!ymmt[year].Honda[model]) {
    ymmt[year].Honda[model] = trims;
    return true;
  }
  return false;
}

let addedCount = 0;

// Add Insight (2000-2006, 2010-2014, 2019-2022)
console.log('\nAdding Honda Insight...');
for (let year = 2000; year <= 2022; year++) {
  // Skip 2007-2009 and 2015-2018 (no Insight those years)
  if ((year >= 2007 && year <= 2009) || (year >= 2015 && year <= 2018)) continue;

  let trims = insightTrims['2000-2006'];
  if (year >= 2010 && year <= 2014) trims = insightTrims['2010-2014'];
  if (year >= 2019) trims = insightTrims['2019-2022'];

  if (addModelToYear(year.toString(), 'Insight', trims)) {
    console.log(`  Added ${year} Insight`);
    addedCount++;
  }
}

// Add Crosstour (2010-2015)
console.log('\nAdding Honda Crosstour...');
for (let year = 2010; year <= 2015; year++) {
  if (addModelToYear(year.toString(), 'Crosstour', crosstourTrims['2010-2015'])) {
    console.log(`  Added ${year} Crosstour`);
    addedCount++;
  }
}

// Sort Honda models alphabetically for each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Honda) {
    const sortedHonda = {};
    Object.keys(ymmt[year].Honda).sort().forEach(model => {
      sortedHonda[model] = ymmt[year].Honda[model];
    });
    ymmt[year].Honda = sortedHonda;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Successfully added ${addedCount} year/model combinations to YMMT data`);
console.log('\nHonda lineup complete - 13 models now available in selector!');
