const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Ford) ymmt[yearStr].Ford = {};
  if (!ymmt[yearStr].Ford[model]) {
    ymmt[yearStr].Ford[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === Fix Bronco YMMT (currently only 2024, need 2021-2025) ===
console.log('=== BRONCO ===');
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'Bronco', ['Base', 'Big Bend', 'Black Diamond', 'Outer Banks', 'Badlands', 'Wildtrak', 'Raptor'])) {
    console.log('  Added ' + year + ' Ford Bronco');
  }
}

// === Bronco Sport (2021-2025) ===
console.log('\n=== BRONCO SPORT ===');
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'Bronco Sport', ['Base', 'Big Bend', 'Outer Banks', 'Badlands', 'Heritage'])) {
    console.log('  Added ' + year + ' Ford Bronco Sport');
  }
}

// === Fix Ranger YMMT (currently 2019-2021, need through 2025) ===
console.log('\n=== RANGER ===');
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Ranger', ['XL', 'XLT', 'Lariat', 'Raptor'])) {
    console.log('  Added ' + year + ' Ford Ranger');
  }
}

// === Fix Escape YMMT (has 2020, 2021, 2025 - fill gaps) ===
console.log('\n=== ESCAPE ===');
// Add 2013-2019 (3rd gen)
for (let year = 2013; year <= 2019; year++) {
  if (addEntry(year, 'Escape', ['S', 'SE', 'SEL', 'Titanium'])) {
    console.log('  Added ' + year + ' Ford Escape');
  }
}
// Fill 2022-2024 gaps
for (let year = 2022; year <= 2024; year++) {
  if (addEntry(year, 'Escape', ['Base', 'Active', 'ST-Line', 'Platinum', 'PHEV'])) {
    console.log('  Added ' + year + ' Ford Escape');
  }
}
// 2026
if (addEntry(2026, 'Escape', ['Base', 'Active', 'ST-Line', 'Platinum'])) {
  console.log('  Added 2026 Ford Escape');
}

// === Edge (2007-2024, discontinued) ===
console.log('\n=== EDGE ===');
for (let year = 2007; year <= 2014; year++) {
  if (addEntry(year, 'Edge', ['SE', 'SEL', 'Limited', 'Sport'])) {
    console.log('  Added ' + year + ' Ford Edge');
  }
}
for (let year = 2015; year <= 2024; year++) {
  if (addEntry(year, 'Edge', ['SE', 'SEL', 'Titanium', 'ST', 'ST-Line'])) {
    console.log('  Added ' + year + ' Ford Edge');
  }
}

// === Expedition (2003-2025) ===
console.log('\n=== EXPEDITION ===');
for (let year = 2003; year <= 2006; year++) {
  if (addEntry(year, 'Expedition', ['XLS', 'XLT', 'Eddie Bauer', 'Limited'])) {
    console.log('  Added ' + year + ' Ford Expedition');
  }
}
for (let year = 2007; year <= 2017; year++) {
  if (addEntry(year, 'Expedition', ['XL', 'XLT', 'Limited', 'King Ranch', 'Platinum'])) {
    console.log('  Added ' + year + ' Ford Expedition');
  }
}
for (let year = 2018; year <= 2025; year++) {
  if (addEntry(year, 'Expedition', ['XL STX', 'XLT', 'Limited', 'King Ranch', 'Platinum', 'Timberline'])) {
    console.log('  Added ' + year + ' Ford Expedition');
  }
}

// === Focus (2012-2018) ===
console.log('\n=== FOCUS ===');
for (let year = 2012; year <= 2018; year++) {
  if (addEntry(year, 'Focus', ['S', 'SE', 'SEL', 'Titanium', 'ST', 'RS'])) {
    console.log('  Added ' + year + ' Ford Focus');
  }
}

// === Fusion (2013-2020) ===
console.log('\n=== FUSION ===');
for (let year = 2013; year <= 2020; year++) {
  if (addEntry(year, 'Fusion', ['S', 'SE', 'SEL', 'Titanium', 'Sport', 'Hybrid', 'Energi'])) {
    console.log('  Added ' + year + ' Ford Fusion');
  }
}

// === F-250 Super Duty (2011-2025) ===
console.log('\n=== F-250 SUPER DUTY ===');
for (let year = 2011; year <= 2016; year++) {
  if (addEntry(year, 'F-250 Super Duty', ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum'])) {
    console.log('  Added ' + year + ' Ford F-250 Super Duty');
  }
}
for (let year = 2017; year <= 2025; year++) {
  if (addEntry(year, 'F-250 Super Duty', ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Tremor'])) {
    console.log('  Added ' + year + ' Ford F-250 Super Duty');
  }
}

// === Transit (2015-2025) ===
console.log('\n=== TRANSIT ===');
for (let year = 2015; year <= 2025; year++) {
  if (addEntry(year, 'Transit', ['Cargo Van', 'Crew Van', 'Passenger Wagon', 'Cutaway'])) {
    console.log('  Added ' + year + ' Ford Transit');
  }
}

// === Transit Connect (2014-2023) ===
console.log('\n=== TRANSIT CONNECT ===');
for (let year = 2014; year <= 2023; year++) {
  if (addEntry(year, 'Transit Connect', ['XL', 'XLT', 'Titanium', 'Cargo Van'])) {
    console.log('  Added ' + year + ' Ford Transit Connect');
  }
}

// === Maverick (2022-2025) ===
console.log('\n=== MAVERICK ===');
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Maverick', ['XL', 'XLT', 'Lariat', 'Tremor'])) {
    console.log('  Added ' + year + ' Ford Maverick');
  }
}

// === Add 2026 for current Ford models ===
console.log('\n=== 2026 MODEL YEAR ===');
const ford2026 = {
  'F-150': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Tremor', 'Raptor'],
  'Mustang': ['EcoBoost', 'GT', 'Dark Horse', 'Mach-E'],
  'Explorer': ['Base', 'XLT', 'ST', 'Limited', 'King Ranch', 'Platinum', 'Timberline'],
  'Bronco': ['Base', 'Big Bend', 'Black Diamond', 'Outer Banks', 'Badlands', 'Wildtrak', 'Raptor'],
  'Bronco Sport': ['Base', 'Big Bend', 'Outer Banks', 'Badlands', 'Heritage'],
  'Ranger': ['XL', 'XLT', 'Lariat', 'Raptor'],
  'Expedition': ['XL STX', 'XLT', 'Limited', 'King Ranch', 'Platinum', 'Timberline'],
  'F-250 Super Duty': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Tremor'],
  'Escape': ['Base', 'Active', 'ST-Line', 'Platinum'],
  'Transit': ['Cargo Van', 'Crew Van', 'Passenger Wagon'],
  'Maverick': ['XL', 'XLT', 'Lariat', 'Tremor']
};
Object.entries(ford2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) {
    console.log('  Added 2026 Ford ' + model);
  }
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].Ford) {
    const sorted = {};
    Object.keys(ymmt[year].Ford).sort().forEach(function(model) {
      sorted[model] = ymmt[year].Ford[model];
    });
    ymmt[year].Ford = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' Ford YMMT entries total');
