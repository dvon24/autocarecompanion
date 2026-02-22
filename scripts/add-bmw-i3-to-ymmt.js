const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW i3 (I01) coverage: 2014-2021
// BEV and REx (Range Extender) variants
// i3s sport variant from 2018+

const trims = {
  '2014-2017': ['i3 BEV', 'i3 REx'],
  '2018-2021': ['i3 BEV', 'i3 REx', 'i3s BEV', 'i3s REx']
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

// I01 generation (2014-2017)
console.log('\nAdding BMW i3 I01 (2014-2017)...');
for (let year = 2014; year <= 2017; year++) {
  if (addModelToYear(year.toString(), 'i3', trims['2014-2017'])) {
    console.log(`  Added ${year} i3`);
    addedCount++;
  }
}

// I01 LCI generation (2018-2021) - added i3s sport variant
console.log('\nAdding BMW i3 I01 LCI (2018-2021)...');
for (let year = 2018; year <= 2021; year++) {
  if (addModelToYear(year.toString(), 'i3', trims['2018-2021'])) {
    console.log(`  Added ${year} i3`);
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

console.log(`\nSuccessfully added ${addedCount} BMW i3 year/model combinations`);
