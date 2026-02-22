const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// BMW 6 Series coverage:
// E63 Coupe / E64 Convertible (2004-2010): 645Ci (2004-2005), 650i (2006-2010)
// F12 Convertible / F13 Coupe / F06 Gran Coupe (2012-2018): 640i, 650i

// BMW M6 coverage:
// E63 M6 (2006-2010): M6
// F06/F12/F13 M6 (2013-2018): M6

const sixSeriesTrims = {
  '2004-2005': ['645Ci'],
  '2006-2010': ['650i'],
  '2012-2018': ['640i', '650i']
};

const m6Trims = {
  '2006-2010': ['M6'],
  '2013-2018': ['M6']
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

// 6 Series E63/E64 (2004-2005) - 645Ci
console.log('\nAdding BMW 6 Series E63/E64 (2004-2005)...');
for (let year = 2004; year <= 2005; year++) {
  if (addModelToYear(year.toString(), '6 Series', sixSeriesTrims['2004-2005'])) {
    console.log(`  Added ${year} 6 Series`);
    addedCount++;
  }
}

// 6 Series E63/E64 (2006-2010) - 650i
console.log('\nAdding BMW 6 Series E63/E64 (2006-2010)...');
for (let year = 2006; year <= 2010; year++) {
  if (addModelToYear(year.toString(), '6 Series', sixSeriesTrims['2006-2010'])) {
    console.log(`  Added ${year} 6 Series`);
    addedCount++;
  }
}

// 6 Series F12/F13/F06 (2012-2018) - 640i, 650i
console.log('\nAdding BMW 6 Series F12/F13/F06 (2012-2018)...');
for (let year = 2012; year <= 2018; year++) {
  if (addModelToYear(year.toString(), '6 Series', sixSeriesTrims['2012-2018'])) {
    console.log(`  Added ${year} 6 Series`);
    addedCount++;
  }
}

// M6 E63 (2006-2010)
console.log('\nAdding BMW M6 E63 (2006-2010)...');
for (let year = 2006; year <= 2010; year++) {
  if (addModelToYear(year.toString(), 'M6', m6Trims['2006-2010'])) {
    console.log(`  Added ${year} M6`);
    addedCount++;
  }
}

// M6 F06/F12/F13 (2013-2018)
console.log('\nAdding BMW M6 F06/F12/F13 (2013-2018)...');
for (let year = 2013; year <= 2018; year++) {
  if (addModelToYear(year.toString(), 'M6', m6Trims['2013-2018'])) {
    console.log(`  Added ${year} M6`);
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

console.log(`\n\u2713 Successfully added ${addedCount} BMW 6 Series / M6 year/model combinations`);
