const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Audi A5/S5 (2008-2023, three generations: B8, B8.5, B9)
const a5Trims = {
  '2008-2012': ['2.0T', '3.2', 'S5'], // B8
  '2013-2016': ['2.0T', 'S5'], // B8.5
  '2017-2023': ['Premium', 'Premium Plus', 'Prestige', 'S line', 'S5'] // B9
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

console.log('\nAdding Audi A5/S5...');
for (let year = 2008; year <= 2023; year++) {
  let trims;
  if (year <= 2012) {
    trims = a5Trims['2008-2012'];
  } else if (year <= 2016) {
    trims = a5Trims['2013-2016'];
  } else {
    trims = a5Trims['2017-2023'];
  }

  if (addModelToYear(year.toString(), 'A5', trims)) {
    console.log(`  Added ${year} A5`);
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

console.log(`\n✓ Successfully added ${addedCount} Audi A5/S5 year/model combinations`);
