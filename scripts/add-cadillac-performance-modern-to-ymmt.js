const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// CTS-V (2004-2019):
// 1st Gen (2004-2007): LS6/LS2 V8
// 2nd Gen (2009-2015): LSA Supercharged V8
// 3rd Gen (2016-2019): LT4 Supercharged V8
//
// CT4 (2020-2025): 2.0T, V (2.7T), V Blackwing (3.6TT)
// CT5 (2020-2025): 2.0T, 3.0T, V (3.0TT), V Blackwing (6.2L SC)
// Lyriq (2023-2025): EV

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

// CTS-V 1st Gen (2004-2007)
console.log('\nAdding Cadillac CTS-V 1st Gen (2004-2007)...');
for (let year = 2004; year <= 2007; year++) {
  if (addModelToYear(year, 'CTS-V', ['5.7L LS6', '6.0L LS2'])) {
    console.log('  Added ' + year + ' CTS-V');
    addedCount++;
  }
}

// CTS-V 2nd Gen (2009-2015) - no 2008 model
console.log('\nAdding Cadillac CTS-V 2nd Gen (2009-2015)...');
for (let year = 2009; year <= 2015; year++) {
  if (addModelToYear(year, 'CTS-V', ['6.2L LSA Supercharged', 'Sedan', 'Coupe', 'Wagon'])) {
    console.log('  Added ' + year + ' CTS-V');
    addedCount++;
  }
}

// CTS-V 3rd Gen (2016-2019)
console.log('\nAdding Cadillac CTS-V 3rd Gen (2016-2019)...');
for (let year = 2016; year <= 2019; year++) {
  if (addModelToYear(year, 'CTS-V', ['6.2L LT4 Supercharged'])) {
    console.log('  Added ' + year + ' CTS-V');
    addedCount++;
  }
}

// CT4 (2020-2025)
console.log('\nAdding Cadillac CT4 (2020-2025)...');
for (let year = 2020; year <= 2021; year++) {
  if (addModelToYear(year, 'CT4', ['2.0T', 'Luxury', 'Premium Luxury', 'Sport', 'V'])) {
    console.log('  Added ' + year + ' CT4');
    addedCount++;
  }
}
for (let year = 2022; year <= 2025; year++) {
  if (addModelToYear(year, 'CT4', ['2.0T', 'Luxury', 'Premium Luxury', 'Sport', 'V', 'V Blackwing'])) {
    console.log('  Added ' + year + ' CT4');
    addedCount++;
  }
}

// CT5 (2020-2025)
console.log('\nAdding Cadillac CT5 (2020-2025)...');
for (let year = 2020; year <= 2021; year++) {
  if (addModelToYear(year, 'CT5', ['2.0T', '3.0T', 'Luxury', 'Premium Luxury', 'Sport', 'V'])) {
    console.log('  Added ' + year + ' CT5');
    addedCount++;
  }
}
for (let year = 2022; year <= 2025; year++) {
  if (addModelToYear(year, 'CT5', ['2.0T', '3.0T', 'Luxury', 'Premium Luxury', 'Sport', 'V', 'V Blackwing'])) {
    console.log('  Added ' + year + ' CT5');
    addedCount++;
  }
}

// Lyriq (2023-2025)
console.log('\nAdding Cadillac Lyriq (2023-2025)...');
for (let year = 2023; year <= 2025; year++) {
  if (addModelToYear(year, 'Lyriq', ['RWD', 'AWD', 'Tech', 'Luxury', 'Sport'])) {
    console.log('  Added ' + year + ' Lyriq');
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

console.log('\nSuccessfully added ' + addedCount + ' Cadillac CTS-V/CT4/CT5/Lyriq year/model combinations');
