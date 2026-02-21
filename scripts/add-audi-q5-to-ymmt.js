const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Audi Q5 (2009-2023, two generations)
const q5Trims = {
  '2009-2017': ['Premium', 'Premium Plus', 'Prestige', '3.0T'], // First gen
  '2018-2023': ['Premium', 'Premium Plus', 'Prestige', 'S line'] // Second gen
};

function addModelToYear(year, model, trims) {
  if (!ymmt[year]) {
    ymmt[year] = {};
  }
  if (!ymmt[year].Audi) {
    ymmt[year].Audi = {};
  }
  if (!ymmt[year].Audi[model]) {
    ymmt[year].Audi[model] = trims;
    return true;
  }
  return false;
}

let addedCount = 0;

console.log('\nAdding Audi Q5...');
for (let year = 2009; year <= 2023; year++) {
  let trims = year <= 2017 ? q5Trims['2009-2017'] : q5Trims['2018-2023'];

  if (addModelToYear(year.toString(), 'Q5', trims)) {
    console.log(`  Added ${year} Q5`);
    addedCount++;
  }
}

// Sort Audi models alphabetically for each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Audi) {
    const sortedAudi = {};
    Object.keys(ymmt[year].Audi).sort().forEach(model => {
      sortedAudi[model] = ymmt[year].Audi[model];
    });
    ymmt[year].Audi = sortedAudi;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Successfully added ${addedCount} Audi Q5 year/model combinations`);
