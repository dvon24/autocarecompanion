const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW 1 Series E82/E88 coverage: 2008-2013
// E82 Coupe / E88 Convertible
// 2008-2013: 128i, 135i
// 2011 only: 1M (1 Series M Coupe)

const trims = {
  '2008-2013': ['128i', '135i'],
  '2011': ['128i', '135i', '1M']
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

// E82/E88 generation (2008-2013)
console.log('\nAdding BMW 1 Series E82/E88 (2008-2013)...');
for (let year = 2008; year <= 2013; year++) {
  const yearTrims = year === 2011 ? trims['2011'] : trims['2008-2013'];
  if (addModelToYear(year.toString(), '1 Series', yearTrims)) {
    console.log(`  Added ${year} 1 Series (${yearTrims.join(', ')})`);
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

console.log(`\n✓ Successfully added ${addedCount} BMW 1 Series year/model combinations`);
