const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Audi A7 (2012-2023, two generations: C7, C8)
const a7Trims = {
  '2012-2018': ['Premium Plus', 'Prestige', 'S7', 'Competition'], // C7
  '2019-2023': ['Premium Plus', 'Prestige', 'S line', 'S7'] // C8
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

console.log('\nAdding Audi A7/S7...');
for (let year = 2012; year <= 2023; year++) {
  let trims = year <= 2018 ? a7Trims['2012-2018'] : a7Trims['2019-2023'];

  if (addModelToYear(year.toString(), 'A7', trims)) {
    console.log(`  Added ${year} A7`);
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

console.log(`\n✓ Successfully added ${addedCount} Audi A7/S7 year/model combinations`);
