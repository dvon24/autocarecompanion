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

// C5 (1997-2004)
console.log('\nAdding Corvette C5 (1997-2004)...');
for (let year = 1997; year <= 2004; year++) {
  const trims = ['Base', 'Z06'];
  if (addModelToYear(year, 'Corvette', trims)) {
    console.log('  Added ' + year + ' Corvette');
    addedCount++;
  }
}

// C6 (2005-2013)
console.log('\nAdding Corvette C6 (2005-2013)...');
for (let year = 2005; year <= 2005; year++) {
  if (addModelToYear(year, 'Corvette', ['Base'])) {
    console.log('  Added ' + year + ' Corvette');
    addedCount++;
  }
}
for (let year = 2006; year <= 2008; year++) {
  if (addModelToYear(year, 'Corvette', ['Base', 'Z06'])) {
    console.log('  Added ' + year + ' Corvette');
    addedCount++;
  }
}
for (let year = 2009; year <= 2013; year++) {
  const trims = ['Base', 'Z06', 'ZR1', 'Grand Sport'];
  if (addModelToYear(year, 'Corvette', trims)) {
    console.log('  Added ' + year + ' Corvette');
    addedCount++;
  }
}

// C7 (2014-2019)
console.log('\nAdding Corvette C7 (2014-2019)...');
for (let year = 2014; year <= 2019; year++) {
  if (addModelToYear(year, 'Corvette', ['Stingray', 'Z06', 'Grand Sport', 'ZR1'])) {
    console.log('  Added ' + year + ' Corvette');
    addedCount++;
  }
}

// C8 (2020-2025)
console.log('\nAdding Corvette C8 (2020-2025)...');
for (let year = 2020; year <= 2022; year++) {
  if (addModelToYear(year, 'Corvette', ['Stingray', '1LT', '2LT', '3LT'])) {
    console.log('  Added ' + year + ' Corvette');
    addedCount++;
  }
}
for (let year = 2023; year <= 2025; year++) {
  if (addModelToYear(year, 'Corvette', ['Stingray', 'Z06', 'E-Ray', '1LT', '2LT', '3LT'])) {
    console.log('  Added ' + year + ' Corvette');
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
console.log('\nSuccessfully added ' + addedCount + ' Chevrolet Corvette year/model combinations');
