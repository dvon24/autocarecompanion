const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// SRX (2004-2016):
// 1st Gen (2004-2009): 3.6L V6, 4.6L Northstar V8
// 2nd Gen (2010-2016): 3.0L V6, 3.6L V6

// XT5 (2017-2025): 3.6L V6, 2.0T (2020+)
// XT4 (2019-2025): 2.0T
// XT6 (2020-2025): 3.6L V6

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

// SRX 1st Gen (2004-2009)
console.log('\nAdding Cadillac SRX 1st Gen (2004-2009)...');
for (let year = 2004; year <= 2009; year++) {
  if (addModelToYear(year, 'SRX', ['3.6L V6', '4.6L V8'])) {
    console.log('  Added ' + year + ' SRX');
    addedCount++;
  }
}

// SRX 2nd Gen (2010-2016)
console.log('\nAdding Cadillac SRX 2nd Gen (2010-2016)...');
for (let year = 2010; year <= 2011; year++) {
  if (addModelToYear(year, 'SRX', ['3.0L V6', '2.8T V6'])) {
    console.log('  Added ' + year + ' SRX');
    addedCount++;
  }
}
for (let year = 2012; year <= 2016; year++) {
  if (addModelToYear(year, 'SRX', ['3.6L V6', 'Base', 'Luxury', 'Performance', 'Premium'])) {
    console.log('  Added ' + year + ' SRX');
    addedCount++;
  }
}

// XT5 (2017-2025)
console.log('\nAdding Cadillac XT5 (2017-2025)...');
for (let year = 2017; year <= 2019; year++) {
  if (addModelToYear(year, 'XT5', ['3.6L V6', 'Base', 'Luxury', 'Premium Luxury', 'Platinum'])) {
    console.log('  Added ' + year + ' XT5');
    addedCount++;
  }
}
for (let year = 2020; year <= 2025; year++) {
  if (addModelToYear(year, 'XT5', ['2.0T', '3.6L V6', 'Luxury', 'Premium Luxury', 'Sport'])) {
    console.log('  Added ' + year + ' XT5');
    addedCount++;
  }
}

// XT4 (2019-2025)
console.log('\nAdding Cadillac XT4 (2019-2025)...');
for (let year = 2019; year <= 2025; year++) {
  if (addModelToYear(year, 'XT4', ['2.0T', 'Luxury', 'Premium Luxury', 'Sport'])) {
    console.log('  Added ' + year + ' XT4');
    addedCount++;
  }
}

// XT6 (2020-2025)
console.log('\nAdding Cadillac XT6 (2020-2025)...');
for (let year = 2020; year <= 2025; year++) {
  if (addModelToYear(year, 'XT6', ['3.6L V6', 'Luxury', 'Premium Luxury', 'Sport'])) {
    console.log('  Added ' + year + ' XT6');
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

console.log('\nSuccessfully added ' + addedCount + ' Cadillac SRX/XT5/XT4/XT6 year/model combinations');
