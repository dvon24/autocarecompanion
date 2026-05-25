const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

function addModelToYear(year, model, trimList) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Chrysler) ymmt[yearStr].Chrysler = {};
  if (!ymmt[yearStr].Chrysler[model]) {
    ymmt[yearStr].Chrysler[model] = trimList;
    return true;
  }
  return false;
}

let addedCount = 0;

// === Chrysler 300 Gen 1 (2005-2010) ===
console.log('\nAdding Chrysler 300 (2005-2010)...');
for (let year = 2005; year <= 2010; year++) {
  if (addModelToYear(year, '300', ['Base', 'Touring', 'Limited', 'C', 'SRT8'])) {
    console.log('  Added ' + year + ' 300');
    addedCount++;
  }
}
// Also add 2024 300 if it exists (it was discontinued in 2023, so skip)

// === Chrysler Pacifica (2017-2025) ===
console.log('\nAdding Chrysler Pacifica (2017-2025)...');
for (let year = 2017; year <= 2020; year++) {
  if (addModelToYear(year, 'Pacifica', ['LX', 'Touring', 'Touring L', 'Touring L Plus', 'Limited', 'Hybrid'])) {
    console.log('  Added ' + year + ' Pacifica');
    addedCount++;
  }
}
for (let year = 2021; year <= 2025; year++) {
  if (addModelToYear(year, 'Pacifica', ['Touring', 'Touring L', 'Limited', 'Pinnacle', 'Hybrid'])) {
    console.log('  Added ' + year + ' Pacifica');
    addedCount++;
  }
}

// === Chrysler Town & Country (2001-2016) ===
console.log('\nAdding Chrysler Town & Country (2001-2016)...');
for (let year = 2001; year <= 2007; year++) {
  if (addModelToYear(year, 'Town & Country', ['LX', 'LXi', 'EX', 'Limited', 'Touring'])) {
    console.log('  Added ' + year + ' Town & Country');
    addedCount++;
  }
}
for (let year = 2008; year <= 2016; year++) {
  if (addModelToYear(year, 'Town & Country', ['LX', 'Touring', 'Touring L', 'Limited', 'S'])) {
    console.log('  Added ' + year + ' Town & Country');
    addedCount++;
  }
}

// === Chrysler 200 (2011-2017) ===
console.log('\nAdding Chrysler 200 (2011-2017)...');
for (let year = 2011; year <= 2014; year++) {
  if (addModelToYear(year, '200', ['LX', 'Touring', 'Limited', 'S', 'Convertible'])) {
    console.log('  Added ' + year + ' 200');
    addedCount++;
  }
}
for (let year = 2015; year <= 2017; year++) {
  if (addModelToYear(year, '200', ['LX', 'Limited', 'S', 'C'])) {
    console.log('  Added ' + year + ' 200');
    addedCount++;
  }
}

// === Chrysler PT Cruiser (2001-2010) ===
console.log('\nAdding Chrysler PT Cruiser (2001-2010)...');
for (let year = 2001; year <= 2002; year++) {
  if (addModelToYear(year, 'PT Cruiser', ['Base', 'Limited', 'Touring'])) {
    console.log('  Added ' + year + ' PT Cruiser');
    addedCount++;
  }
}
for (let year = 2003; year <= 2010; year++) {
  if (addModelToYear(year, 'PT Cruiser', ['Base', 'Touring', 'Limited', 'GT Turbo'])) {
    console.log('  Added ' + year + ' PT Cruiser');
    addedCount++;
  }
}

// === Chrysler Sebring (2001-2010) ===
console.log('\nAdding Chrysler Sebring (2001-2010)...');
for (let year = 2001; year <= 2006; year++) {
  if (addModelToYear(year, 'Sebring', ['LX', 'LXi', 'Limited', 'Touring', 'Convertible'])) {
    console.log('  Added ' + year + ' Sebring');
    addedCount++;
  }
}
for (let year = 2007; year <= 2010; year++) {
  if (addModelToYear(year, 'Sebring', ['Base', 'Touring', 'Limited', 'Convertible'])) {
    console.log('  Added ' + year + ' Sebring');
    addedCount++;
  }
}

// === Chrysler Crossfire (2004-2008) ===
console.log('\nAdding Chrysler Crossfire (2004-2008)...');
for (let year = 2004; year <= 2008; year++) {
  if (addModelToYear(year, 'Crossfire', ['Base', 'Limited', 'SRT-6'])) {
    console.log('  Added ' + year + ' Crossfire');
    addedCount++;
  }
}

// === Chrysler Aspen (2007-2009) ===
console.log('\nAdding Chrysler Aspen (2007-2009)...');
for (let year = 2007; year <= 2009; year++) {
  if (addModelToYear(year, 'Aspen', ['Base', 'Limited', 'Hybrid'])) {
    console.log('  Added ' + year + ' Aspen');
    addedCount++;
  }
}

// === Chrysler Voyager (2020-2024) ===
console.log('\nAdding Chrysler Voyager (2020-2024)...');
for (let year = 2020; year <= 2024; year++) {
  if (addModelToYear(year, 'Voyager', ['L', 'LX', 'LXi'])) {
    console.log('  Added ' + year + ' Voyager');
    addedCount++;
  }
}

// Sort Chrysler models alphabetically within each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Chrysler) {
    const sorted = {};
    Object.keys(ymmt[year].Chrysler).sort().forEach(model => {
      sorted[model] = ymmt[year].Chrysler[model];
    });
    ymmt[year].Chrysler = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nSuccessfully added ' + addedCount + ' Chrysler year/model combinations');
