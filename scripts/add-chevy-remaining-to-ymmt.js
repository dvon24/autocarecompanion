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

// Impala (2006-2020) - only add if not already present
console.log('\nAdding Chevrolet Impala (2006-2020)...');
for (let year = 2006; year <= 2013; year++) {
  if (addModelToYear(year, 'Impala', ['LS', 'LT', 'LTZ', 'SS'])) {
    console.log('  Added ' + year + ' Impala');
    addedCount++;
  }
}
for (let year = 2014; year <= 2020; year++) {
  if (addModelToYear(year, 'Impala', ['LS', 'LT', 'Premier'])) {
    console.log('  Added ' + year + ' Impala');
    addedCount++;
  }
}

// Cruze (2011-2019)
console.log('\nAdding Chevrolet Cruze (2011-2019)...');
for (let year = 2011; year <= 2016; year++) {
  if (addModelToYear(year, 'Cruze', ['LS', 'LT', 'LTZ', 'Eco', 'Diesel'])) {
    console.log('  Added ' + year + ' Cruze');
    addedCount++;
  }
}
for (let year = 2017; year <= 2019; year++) {
  if (addModelToYear(year, 'Cruze', ['L', 'LS', 'LT', 'Premier', 'Diesel'])) {
    console.log('  Added ' + year + ' Cruze');
    addedCount++;
  }
}

// Blazer (2019-2025)
console.log('\nAdding Chevrolet Blazer (2019-2025)...');
for (let year = 2019; year <= 2025; year++) {
  if (addModelToYear(year, 'Blazer', ['2.0T', '2.5L', '3.6L V6', 'LT', 'RS', 'Premier'])) {
    console.log('  Added ' + year + ' Blazer');
    addedCount++;
  }
}

// Trax (2015-2025)
console.log('\nAdding Chevrolet Trax (2015-2025)...');
for (let year = 2015; year <= 2022; year++) {
  if (addModelToYear(year, 'Trax', ['LS', 'LT', 'Premier'])) {
    console.log('  Added ' + year + ' Trax');
    addedCount++;
  }
}
for (let year = 2024; year <= 2025; year++) {
  if (addModelToYear(year, 'Trax', ['LS', 'LT', '1RS', 'ACTIV'])) {
    console.log('  Added ' + year + ' Trax');
    addedCount++;
  }
}

// Trailblazer (2021-2025)
console.log('\nAdding Chevrolet Trailblazer (2021-2025)...');
for (let year = 2021; year <= 2025; year++) {
  if (addModelToYear(year, 'Trailblazer', ['L', 'LS', 'LT', 'ACTIV', 'RS'])) {
    console.log('  Added ' + year + ' Trailblazer');
    addedCount++;
  }
}

// Spark (2013-2022)
console.log('\nAdding Chevrolet Spark (2013-2022)...');
for (let year = 2013; year <= 2022; year++) {
  if (addModelToYear(year, 'Spark', ['LS', 'LT', '1LT', '2LT', 'ACTIV'])) {
    console.log('  Added ' + year + ' Spark');
    addedCount++;
  }
}

// Sort
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
console.log('\nSuccessfully added ' + addedCount + ' Chevrolet remaining year/model combinations');
