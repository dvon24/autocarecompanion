const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].RAM) ymmt[yearStr].RAM = {};
  if (!ymmt[yearStr].RAM[model]) {
    ymmt[yearStr].RAM[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === RAM 1500 (2009-2025) - RAM split from Dodge in 2010, but 2009 is transitional ===
console.log('=== 1500 ===');
// 4th gen DS (2009-2018) - already have some entries
for (let year = 2009; year <= 2018; year++) {
  if (addEntry(year, '1500', ['Tradesman', 'Express', 'SLT', 'Big Horn', 'Lone Star', 'Sport', 'Laramie', 'Laramie Longhorn', 'Limited', 'Rebel'])) console.log('  Added ' + year);
}
// 5th gen DT (2019-2025)
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, '1500', ['Tradesman', 'Big Horn', 'Lone Star', 'Laramie', 'Rebel', 'Limited', 'Limited Longhorn', 'TRX', 'REV'])) console.log('  Added ' + year);
}

// === RAM 2500 (2010-2025) ===
console.log('\n=== 2500 ===');
// 4th gen (2010-2018)
for (let year = 2010; year <= 2018; year++) {
  if (addEntry(year, '2500', ['Tradesman', 'SLT', 'Big Horn', 'Lone Star', 'Laramie', 'Laramie Longhorn', 'Limited', 'Power Wagon'])) console.log('  Added ' + year);
}
// 5th gen (2019-2025)
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, '2500', ['Tradesman', 'Big Horn', 'Lone Star', 'Laramie', 'Limited', 'Limited Longhorn', 'Power Wagon', 'Rebel'])) console.log('  Added ' + year);
}

// === RAM 3500 (2010-2025) ===
console.log('\n=== 3500 ===');
// 4th gen (2010-2018)
for (let year = 2010; year <= 2018; year++) {
  if (addEntry(year, '3500', ['Tradesman', 'SLT', 'Big Horn', 'Lone Star', 'Laramie', 'Laramie Longhorn', 'Limited'])) console.log('  Added ' + year);
}
// 5th gen (2019-2025)
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, '3500', ['Tradesman', 'Big Horn', 'Lone Star', 'Laramie', 'Limited', 'Limited Longhorn'])) console.log('  Added ' + year);
}

// === ProMaster (2014-2025) ===
console.log('\n=== PROMASTER ===');
for (let year = 2014; year <= 2025; year++) {
  if (addEntry(year, 'ProMaster', ['1500', '2500', '3500', 'Chassis Cab', 'Cutaway', 'Window Van'])) console.log('  Added ' + year);
}

// === ProMaster City (2015-2022) ===
console.log('\n=== PROMASTER CITY ===');
for (let year = 2015; year <= 2022; year++) {
  if (addEntry(year, 'ProMaster City', ['Tradesman', 'Tradesman SLT', 'Wagon', 'Wagon SLT'])) console.log('  Added ' + year);
}

// === RAM 1500 Classic (2019-2024) - continued DS platform alongside new DT ===
console.log('\n=== 1500 CLASSIC ===');
for (let year = 2019; year <= 2024; year++) {
  if (addEntry(year, '1500 Classic', ['Tradesman', 'Express', 'SLT', 'Big Horn', 'Warlock'])) console.log('  Added ' + year);
}

// === 2026 Model Year ===
console.log('\n=== 2026 MODEL YEAR ===');
const ram2026 = {
  '1500': ['Tradesman', 'Big Horn', 'Lone Star', 'Laramie', 'Rebel', 'Limited', 'Limited Longhorn', 'REV'],
  '2500': ['Tradesman', 'Big Horn', 'Lone Star', 'Laramie', 'Limited', 'Limited Longhorn', 'Power Wagon', 'Rebel'],
  '3500': ['Tradesman', 'Big Horn', 'Lone Star', 'Laramie', 'Limited', 'Limited Longhorn'],
  'ProMaster': ['1500', '2500', '3500', 'Chassis Cab', 'Cutaway', 'Window Van'],
};
Object.entries(ram2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) console.log('  Added 2026 RAM ' + model);
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].RAM) {
    const sorted = {};
    Object.keys(ymmt[year].RAM).sort().forEach(function(model) {
      sorted[model] = ymmt[year].RAM[model];
    });
    ymmt[year].RAM = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' RAM YMMT entries total');
