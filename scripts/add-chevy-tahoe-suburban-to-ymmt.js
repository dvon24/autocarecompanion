const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

function addModelToYear(year, model, trimList) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Chevrolet) ymmt[yearStr].Chevrolet = {};
  if (!ymmt[yearStr].Chevrolet[model]) {
    ymmt[yearStr].Chevrolet[model] = trimList;
    return true;
  }
  return false;
}

let addedCount = 0;

// Tahoe GMT800 (2000-2006)
console.log('\nAdding Chevrolet Tahoe GMT800 (2000-2006)...');
for (let year = 2000; year <= 2006; year++) {
  if (addModelToYear(year, 'Tahoe', ['LS', 'LT', 'Z71'])) {
    console.log('  Added ' + year + ' Tahoe');
    addedCount++;
  }
}

// Tahoe GMT900 (2007-2014)
console.log('\nAdding Chevrolet Tahoe GMT900 (2007-2014)...');
for (let year = 2007; year <= 2014; year++) {
  if (addModelToYear(year, 'Tahoe', ['LS', 'LT', 'LTZ', 'Z71', 'PPV'])) {
    console.log('  Added ' + year + ' Tahoe');
    addedCount++;
  }
}

// Tahoe K2XX (2015-2020)
console.log('\nAdding Chevrolet Tahoe K2XX (2015-2020)...');
for (let year = 2015; year <= 2020; year++) {
  if (addModelToYear(year, 'Tahoe', ['LS', 'LT', 'Premier', 'RST', 'Z71'])) {
    console.log('  Added ' + year + ' Tahoe');
    addedCount++;
  }
}

// Tahoe T1XX (2021-2025)
console.log('\nAdding Chevrolet Tahoe T1XX (2021-2025)...');
for (let year = 2021; year <= 2025; year++) {
  if (addModelToYear(year, 'Tahoe', ['LS', 'LT', 'RST', 'Z71', 'Premier', 'High Country'])) {
    console.log('  Added ' + year + ' Tahoe');
    addedCount++;
  }
}

// Suburban GMT800 (2000-2006)
console.log('\nAdding Chevrolet Suburban GMT800 (2000-2006)...');
for (let year = 2000; year <= 2006; year++) {
  if (addModelToYear(year, 'Suburban', ['1500 LS', '1500 LT', '2500 LS', '2500 LT'])) {
    console.log('  Added ' + year + ' Suburban');
    addedCount++;
  }
}

// Suburban GMT900 (2007-2014)
console.log('\nAdding Chevrolet Suburban GMT900 (2007-2014)...');
for (let year = 2007; year <= 2014; year++) {
  if (addModelToYear(year, 'Suburban', ['1500 LS', '1500 LT', '1500 LTZ', '2500 LS', '2500 LT'])) {
    console.log('  Added ' + year + ' Suburban');
    addedCount++;
  }
}

// Suburban K2XX (2015-2020)
console.log('\nAdding Chevrolet Suburban K2XX (2015-2020)...');
for (let year = 2015; year <= 2020; year++) {
  if (addModelToYear(year, 'Suburban', ['LS', 'LT', 'Premier', 'RST'])) {
    console.log('  Added ' + year + ' Suburban');
    addedCount++;
  }
}

// Suburban T1XX (2021-2025)
console.log('\nAdding Chevrolet Suburban T1XX (2021-2025)...');
for (let year = 2021; year <= 2025; year++) {
  if (addModelToYear(year, 'Suburban', ['LS', 'LT', 'RST', 'Z71', 'Premier', 'High Country'])) {
    console.log('  Added ' + year + ' Suburban');
    addedCount++;
  }
}

// Sort Chevrolet models alphabetically
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Chevrolet) {
    const sorted = {};
    Object.keys(ymmt[year].Chevrolet).sort().forEach(model => {
      sorted[model] = ymmt[year].Chevrolet[model];
    });
    ymmt[year].Chevrolet = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nSuccessfully added ' + addedCount + ' Chevrolet Tahoe/Suburban year/model combinations');
