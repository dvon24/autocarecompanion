const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].GMC) ymmt[yearStr].GMC = {};
  if (!ymmt[yearStr].GMC[model]) {
    ymmt[yearStr].GMC[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === Sierra 1500 (2007-2025) ===
console.log('=== SIERRA 1500 ===');
// GMT900 (2007-2013)
for (let year = 2007; year <= 2013; year++) {
  if (addEntry(year, 'Sierra 1500', ['Base', 'SL', 'SLE', 'SLT', 'Denali'])) {
    console.log('  Added ' + year);
  }
}
// K2XX (2014-2018)
for (let year = 2014; year <= 2018; year++) {
  if (addEntry(year, 'Sierra 1500', ['Base', 'SLE', 'SLT', 'Denali', 'All Terrain'])) {
    console.log('  Added ' + year);
  }
}
// T1XX (2019-2025)
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, 'Sierra 1500', ['Pro', 'SLE', 'Elevation', 'SLT', 'AT4', 'AT4X', 'Denali', 'Denali Ultimate'])) {
    console.log('  Added ' + year);
  }
}

// === Sierra 2500HD/3500HD (2011-2025) ===
console.log('\n=== SIERRA 2500HD ===');
for (let year = 2011; year <= 2019; year++) {
  if (addEntry(year, 'Sierra 2500HD', ['Base', 'SLE', 'SLT', 'Denali'])) {
    console.log('  Added ' + year);
  }
}
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'Sierra 2500HD', ['Pro', 'SLE', 'SLT', 'AT4', 'AT4X', 'Denali', 'Denali Ultimate'])) {
    console.log('  Added ' + year);
  }
}

console.log('\n=== SIERRA 3500HD ===');
for (let year = 2011; year <= 2019; year++) {
  if (addEntry(year, 'Sierra 3500HD', ['Base', 'SLE', 'SLT', 'Denali'])) {
    console.log('  Added ' + year);
  }
}
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'Sierra 3500HD', ['Pro', 'SLE', 'SLT', 'AT4', 'Denali', 'Denali Ultimate'])) {
    console.log('  Added ' + year);
  }
}

// === Yukon / Yukon XL (2007-2025) ===
console.log('\n=== YUKON ===');
// GMT900 (2007-2014)
for (let year = 2007; year <= 2014; year++) {
  if (addEntry(year, 'Yukon', ['SLE', 'SLT', 'Denali'])) {
    console.log('  Added ' + year);
  }
}
// K2UC (2015-2020)
for (let year = 2015; year <= 2020; year++) {
  if (addEntry(year, 'Yukon', ['SLE', 'SLT', 'Denali'])) {
    console.log('  Added ' + year);
  }
}
// T1 (2021-2025)
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'Yukon', ['SLE', 'SLT', 'AT4', 'Denali', 'Denali Ultimate'])) {
    console.log('  Added ' + year);
  }
}

console.log('\n=== YUKON XL ===');
for (let year = 2007; year <= 2014; year++) {
  if (addEntry(year, 'Yukon XL', ['SLE', 'SLT', 'Denali'])) {
    console.log('  Added ' + year);
  }
}
for (let year = 2015; year <= 2020; year++) {
  if (addEntry(year, 'Yukon XL', ['SLE', 'SLT', 'Denali'])) {
    console.log('  Added ' + year);
  }
}
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'Yukon XL', ['SLE', 'SLT', 'AT4', 'Denali', 'Denali Ultimate'])) {
    console.log('  Added ' + year);
  }
}

// === Acadia (2007-2025) ===
console.log('\n=== ACADIA ===');
// 1st gen (2007-2016)
for (let year = 2007; year <= 2016; year++) {
  if (addEntry(year, 'Acadia', ['SL', 'SLE', 'SLT', 'Denali'])) {
    console.log('  Added ' + year);
  }
}
// 2nd gen (2017-2025)
for (let year = 2017; year <= 2025; year++) {
  if (addEntry(year, 'Acadia', ['SL', 'SLE', 'SLT', 'AT4', 'Denali'])) {
    console.log('  Added ' + year);
  }
}

// === Terrain (2010-2025) ===
console.log('\n=== TERRAIN ===');
// 1st gen (2010-2017)
for (let year = 2010; year <= 2017; year++) {
  if (addEntry(year, 'Terrain', ['SL', 'SLE', 'SLT', 'Denali'])) {
    console.log('  Added ' + year);
  }
}
// 2nd gen (2018-2025)
for (let year = 2018; year <= 2025; year++) {
  if (addEntry(year, 'Terrain', ['SL', 'SLE', 'SLT', 'AT4', 'Denali'])) {
    console.log('  Added ' + year);
  }
}

// === Canyon (2015-2025) ===
console.log('\n=== CANYON ===');
// 1st gen (2015-2022)
for (let year = 2015; year <= 2022; year++) {
  if (addEntry(year, 'Canyon', ['Base', 'SLE', 'SLT', 'All Terrain', 'Denali', 'AT4'])) {
    console.log('  Added ' + year);
  }
}
// 2nd gen (2023-2025)
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'Canyon', ['Elevation', 'AT4', 'AT4X', 'Denali'])) {
    console.log('  Added ' + year);
  }
}

// === Envoy (2002-2009) ===
console.log('\n=== ENVOY ===');
for (let year = 2002; year <= 2009; year++) {
  if (addEntry(year, 'Envoy', ['SLE', 'SLT', 'Denali', 'XL', 'XUV'])) {
    console.log('  Added ' + year);
  }
}

// === Savana (2003-2025) ===
console.log('\n=== SAVANA ===');
for (let year = 2003; year <= 2025; year++) {
  if (addEntry(year, 'Savana', ['Cargo Van', 'Passenger Van', 'Cutaway'])) {
    console.log('  Added ' + year);
  }
}

// === 2026 Model Year ===
console.log('\n=== 2026 MODEL YEAR ===');
const gmc2026 = {
  'Sierra 1500': ['Pro', 'SLE', 'Elevation', 'SLT', 'AT4', 'AT4X', 'Denali', 'Denali Ultimate'],
  'Sierra 2500HD': ['Pro', 'SLE', 'SLT', 'AT4', 'AT4X', 'Denali', 'Denali Ultimate'],
  'Sierra 3500HD': ['Pro', 'SLE', 'SLT', 'AT4', 'Denali', 'Denali Ultimate'],
  'Yukon': ['SLE', 'SLT', 'AT4', 'Denali', 'Denali Ultimate'],
  'Yukon XL': ['SLE', 'SLT', 'AT4', 'Denali', 'Denali Ultimate'],
  'Acadia': ['SL', 'SLE', 'SLT', 'AT4', 'Denali'],
  'Terrain': ['SL', 'SLE', 'SLT', 'AT4', 'Denali'],
  'Canyon': ['Elevation', 'AT4', 'AT4X', 'Denali'],
  'Savana': ['Cargo Van', 'Passenger Van']
};
Object.entries(gmc2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) {
    console.log('  Added 2026 GMC ' + model);
  }
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].GMC) {
    const sorted = {};
    Object.keys(ymmt[year].GMC).sort().forEach(function(model) {
      sorted[model] = ymmt[year].GMC[model];
    });
    ymmt[year].GMC = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' GMC YMMT entries total');
