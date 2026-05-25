const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// DeVille (1994-2005): Base, DHS, DTS (trim)
// DTS (2006-2011): Base, Luxury, Performance, Platinum
// Seville (1998-2004): SLS, STS
// Eldorado (1993-2002): Base, ETC (Touring Coupe)
// XTS (2013-2019): Base, Luxury, Premium, Platinum, V-Sport

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

// DeVille (1994-2005)
console.log('\nAdding Cadillac DeVille (1994-2005)...');
for (let year = 1994; year <= 1999; year++) {
  if (addModelToYear(year, 'DeVille', ['Base', 'Concours'])) {
    console.log('  Added ' + year + ' DeVille');
    addedCount++;
  }
}
for (let year = 2000; year <= 2005; year++) {
  if (addModelToYear(year, 'DeVille', ['Base', 'DHS', 'DTS'])) {
    console.log('  Added ' + year + ' DeVille');
    addedCount++;
  }
}

// DTS (2006-2011)
console.log('\nAdding Cadillac DTS (2006-2011)...');
for (let year = 2006; year <= 2011; year++) {
  if (addModelToYear(year, 'DTS', ['Base', 'Luxury', 'Performance', 'Platinum'])) {
    console.log('  Added ' + year + ' DTS');
    addedCount++;
  }
}

// Seville (1998-2004)
console.log('\nAdding Cadillac Seville (1998-2004)...');
for (let year = 1998; year <= 2004; year++) {
  if (addModelToYear(year, 'Seville', ['SLS', 'STS'])) {
    console.log('  Added ' + year + ' Seville');
    addedCount++;
  }
}

// Eldorado (1993-2002)
console.log('\nAdding Cadillac Eldorado (1993-2002)...');
for (let year = 1993; year <= 2002; year++) {
  if (addModelToYear(year, 'Eldorado', ['Base', 'ETC'])) {
    console.log('  Added ' + year + ' Eldorado');
    addedCount++;
  }
}

// XTS (2013-2019)
console.log('\nAdding Cadillac XTS (2013-2019)...');
for (let year = 2013; year <= 2019; year++) {
  if (addModelToYear(year, 'XTS', ['Base', 'Luxury', 'Premium', 'Platinum', 'V-Sport'])) {
    console.log('  Added ' + year + ' XTS');
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

console.log('\nSuccessfully added ' + addedCount + ' Cadillac legacy sedan year/model combinations');
