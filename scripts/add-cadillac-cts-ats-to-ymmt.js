const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// CTS (2003-2019):
// 1st Gen (2003-2007): Base, V (2004+)
// 2nd Gen (2008-2013): Base, Premium, Performance, V (2009+), Sport Wagon
// 3rd Gen (2014-2019): 2.0T, 3.6L, V-Sport (twin-turbo 3.6L), V (2016+)

// ATS (2013-2019):
// 2013-2019: 2.5L, 2.0T, 3.6L, V (2016+)

function addModelToYear(year, model, trimList) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Cadillac) ymmt[yearStr].Cadillac = {};
  if (!ymmt[yearStr].Cadillac[model]) {
    ymmt[yearStr].Cadillac[model] = trimList;
    return true;
  }
  return false;
}

let addedCount = 0;

// CTS 1st Gen (2003-2007)
console.log('\nAdding Cadillac CTS 1st Gen (2003-2007)...');
for (let year = 2003; year <= 2003; year++) {
  if (addModelToYear(year, 'CTS', ['3.2L', '3.6L'])) {
    console.log('  Added ' + year + ' CTS');
    addedCount++;
  }
}
for (let year = 2004; year <= 2007; year++) {
  if (addModelToYear(year, 'CTS', ['2.8L', '3.6L'])) {
    console.log('  Added ' + year + ' CTS');
    addedCount++;
  }
}

// CTS 2nd Gen (2008-2013)
console.log('\nAdding Cadillac CTS 2nd Gen (2008-2013)...');
for (let year = 2008; year <= 2008; year++) {
  if (addModelToYear(year, 'CTS', ['3.6L', 'Di'])) {
    console.log('  Added ' + year + ' CTS');
    addedCount++;
  }
}
for (let year = 2009; year <= 2013; year++) {
  if (addModelToYear(year, 'CTS', ['3.0L', '3.6L', 'Premium', 'Performance'])) {
    console.log('  Added ' + year + ' CTS');
    addedCount++;
  }
}

// CTS 3rd Gen (2014-2019)
console.log('\nAdding Cadillac CTS 3rd Gen (2014-2019)...');
for (let year = 2014; year <= 2019; year++) {
  if (addModelToYear(year, 'CTS', ['2.0T', '3.6L', 'V-Sport', 'Premium Luxury'])) {
    console.log('  Added ' + year + ' CTS');
    addedCount++;
  }
}

// ATS (2013-2019)
console.log('\nAdding Cadillac ATS (2013-2019)...');
for (let year = 2013; year <= 2019; year++) {
  if (addModelToYear(year, 'ATS', ['2.5L', '2.0T', '3.6L', 'Premium'])) {
    console.log('  Added ' + year + ' ATS');
    addedCount++;
  }
}

// Sort Cadillac models alphabetically
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

console.log('\nSuccessfully added ' + addedCount + ' Cadillac CTS/ATS year/model combinations');
