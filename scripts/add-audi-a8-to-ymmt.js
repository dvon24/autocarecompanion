const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Audi A8 (2011-2023, two generations: D4, D5)
const a8Trims = {
  '2011-2017': ['3.0T', '4.0T', 'TDI', 'L'], // D4
  '2018-2023': ['55 TFSI', '60 TFSI', 'L'] // D5
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

console.log('\nAdding Audi A8...');
for (let year = 2011; year <= 2023; year++) {
  let trims = year <= 2017 ? a8Trims['2011-2017'] : a8Trims['2018-2023'];

  if (addModelToYear(year.toString(), 'A8', trims)) {
    console.log(`  Added ${year} A8`);
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

console.log(`\n✓ Successfully added ${addedCount} Audi A8 year/model combinations`);
