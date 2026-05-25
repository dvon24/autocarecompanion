const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Audi A6 (2005-2023, three generations)
const a6Trims = {
  '2005-2011': ['3.2 Quattro', '4.2 Quattro', '2.0T', 'TDI'], // C6
  '2012-2018': ['2.0T', '3.0T', 'TDI', 'Competition'], // C7
  '2019-2023': ['Premium', 'Premium Plus', 'Prestige', 'S line'] // C8
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

console.log('\nAdding Audi A6...');
for (let year = 2005; year <= 2023; year++) {
  let trims;
  if (year <= 2011) {
    trims = a6Trims['2005-2011'];
  } else if (year <= 2018) {
    trims = a6Trims['2012-2018'];
  } else {
    trims = a6Trims['2019-2023'];
  }

  if (addModelToYear(year.toString(), 'A6', trims)) {
    console.log(`  Added ${year} A6`);
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

console.log(`\n✓ Successfully added ${addedCount} Audi A6 year/model combinations`);
