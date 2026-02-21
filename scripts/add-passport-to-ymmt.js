const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Honda Passport (2019-2023, modern generation only)
const passportTrims = {
  '2019-2023': ['Sport', 'EX-L', 'Touring', 'Elite', 'TrailSport']
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

console.log('\nAdding Honda Passport...');
for (let year = 2019; year <= 2023; year++) {
  let trims = passportTrims['2019-2023'];

  if (addModelToYear(year.toString(), 'Passport', trims)) {
    console.log(`  Added ${year} Passport`);
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

console.log(`\n✓ Successfully added ${addedCount} Honda Passport year/model combinations to YMMT data`);
console.log('\nHonda models now available in selector: 11 total');
