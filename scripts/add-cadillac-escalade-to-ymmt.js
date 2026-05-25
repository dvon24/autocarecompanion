const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Cadillac Escalade coverage: 2002-2025
// 2nd Gen (2002-2006): Base, ESV, EXT
// 3rd Gen (2007-2014): Base, ESV, EXT (EXT dropped after 2013), Hybrid (2009-2013)
// 4th Gen (2015-2020): Base, ESV
// 5th Gen (2021-2025): Base, ESV, Escalade-V (2023+)

const trims = {
  '2002-2006': ['Base', 'ESV', 'EXT'],
  '2007-2008': ['Base', 'ESV', 'EXT'],
  '2009-2013': ['Base', 'ESV', 'EXT', 'Hybrid'],
  '2014': ['Base', 'ESV'],
  '2015-2020': ['Base', 'ESV', 'Premium Luxury', 'Platinum'],
  '2021-2022': ['Base', 'ESV', 'Premium Luxury', 'Sport', 'Platinum'],
  '2023-2025': ['Base', 'ESV', 'Premium Luxury', 'Sport', 'Platinum', 'V']
};

function addModelToYear(year, model, trimList) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) {
    ymmt[yearStr] = {};
  }
  if (!ymmt[yearStr].Cadillac) {
    ymmt[yearStr].Cadillac = {};
  }
  if (!ymmt[yearStr].Cadillac[model]) {
    ymmt[yearStr].Cadillac[model] = trimList;
    return true;
  }
  return false;
}

let addedCount = 0;

// 2nd Gen (2002-2006)
console.log('\nAdding Cadillac Escalade 2nd Gen (2002-2006)...');
for (let year = 2002; year <= 2006; year++) {
  if (addModelToYear(year, 'Escalade', trims['2002-2006'])) {
    console.log('  Added ' + year + ' Escalade');
    addedCount++;
  }
}

// 3rd Gen (2007-2014)
console.log('\nAdding Cadillac Escalade 3rd Gen (2007-2014)...');
for (let year = 2007; year <= 2008; year++) {
  if (addModelToYear(year, 'Escalade', trims['2007-2008'])) {
    console.log('  Added ' + year + ' Escalade');
    addedCount++;
  }
}
for (let year = 2009; year <= 2013; year++) {
  if (addModelToYear(year, 'Escalade', trims['2009-2013'])) {
    console.log('  Added ' + year + ' Escalade');
    addedCount++;
  }
}
if (addModelToYear(2014, 'Escalade', trims['2014'])) {
  console.log('  Added 2014 Escalade');
  addedCount++;
}

// 4th Gen (2015-2020)
console.log('\nAdding Cadillac Escalade 4th Gen (2015-2020)...');
for (let year = 2015; year <= 2020; year++) {
  if (addModelToYear(year, 'Escalade', trims['2015-2020'])) {
    console.log('  Added ' + year + ' Escalade');
    addedCount++;
  }
}

// 5th Gen (2021-2025)
console.log('\nAdding Cadillac Escalade 5th Gen (2021-2025)...');
for (let year = 2021; year <= 2022; year++) {
  if (addModelToYear(year, 'Escalade', trims['2021-2022'])) {
    console.log('  Added ' + year + ' Escalade');
    addedCount++;
  }
}
for (let year = 2023; year <= 2025; year++) {
  if (addModelToYear(year, 'Escalade', trims['2023-2025'])) {
    console.log('  Added ' + year + ' Escalade');
    addedCount++;
  }
}

// Sort Cadillac models alphabetically for each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Cadillac) {
    const sorted = {};
    Object.keys(ymmt[year].Cadillac).sort().forEach(model => {
      sorted[model] = ymmt[year].Cadillac[model];
    });
    ymmt[year].Cadillac = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log('\nSuccessfully added ' + addedCount + ' Cadillac Escalade year/model combinations');
