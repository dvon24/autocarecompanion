const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Toyota) ymmt[yearStr].Toyota = {};
  if (!ymmt[yearStr].Toyota[model]) {
    ymmt[yearStr].Toyota[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === Camry (2002-2025) ===
console.log('=== CAMRY ===');
for (let year = 2002; year <= 2006; year++) {
  if (addEntry(year, 'Camry', ['LE', 'SE', 'XLE'])) console.log('  Added ' + year);
}
for (let year = 2007; year <= 2011; year++) {
  if (addEntry(year, 'Camry', ['LE', 'SE', 'XLE', 'Hybrid'])) console.log('  Added ' + year);
}
for (let year = 2018; year <= 2024; year++) {
  if (addEntry(year, 'Camry', ['L', 'LE', 'SE', 'XLE', 'XSE', 'TRD', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE', 'Hybrid XSE'])) console.log('  Added ' + year);
}
if (addEntry(2025, 'Camry', ['LE', 'SE', 'XLE', 'XSE'])) console.log('  Added 2025');

// === Corolla (2003-2025) ===
console.log('\n=== COROLLA ===');
for (let year = 2003; year <= 2008; year++) {
  if (addEntry(year, 'Corolla', ['CE', 'LE', 'S', 'XRS'])) console.log('  Added ' + year);
}
for (let year = 2009; year <= 2013; year++) {
  if (addEntry(year, 'Corolla', ['Base', 'LE', 'S', 'XLE', 'XRS'])) console.log('  Added ' + year);
}
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'Corolla', ['L', 'LE', 'SE', 'XLE', 'XSE', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE'])) console.log('  Added ' + year);
}

// === RAV4 (2006-2025) ===
console.log('\n=== RAV4 ===');
for (let year = 2006; year <= 2012; year++) {
  if (addEntry(year, 'RAV4', ['Base', 'Sport', 'Limited'])) console.log('  Added ' + year);
}
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'RAV4', ['LE', 'XLE', 'XLE Premium', 'SE', 'XSE', 'Adventure', 'TRD Off-Road', 'Limited', 'Hybrid', 'Prime'])) console.log('  Added ' + year);
}

// === Tacoma (2005-2025) ===
console.log('\n=== TACOMA ===');
for (let year = 2005; year <= 2015; year++) {
  if (addEntry(year, 'Tacoma', ['Base', 'PreRunner', 'X-Runner', 'SR5', 'TRD Sport', 'TRD Off-Road'])) console.log('  Added ' + year);
}
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'Tacoma', ['SR', 'SR5', 'TRD Sport', 'TRD Off-Road', 'Limited', 'TRD Pro', 'Trailhunter'])) console.log('  Added ' + year);
}

// === Tundra (2000-2025) ===
console.log('\n=== TUNDRA ===');
for (let year = 2000; year <= 2006; year++) {
  if (addEntry(year, 'Tundra', ['Base', 'SR5', 'Limited'])) console.log('  Added ' + year);
}
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'Tundra', ['SR', 'SR5', 'Limited', 'Platinum', 'TRD Pro', '1794 Edition', 'Capstone', 'i-FORCE MAX'])) console.log('  Added ' + year);
}

// === 4Runner (2003-2025) ===
console.log('\n=== 4RUNNER ===');
for (let year = 2003; year <= 2009; year++) {
  if (addEntry(year, '4Runner', ['SR5', 'Sport Edition', 'Limited'])) console.log('  Added ' + year);
}
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, '4Runner', ['SR5', 'TRD Sport', 'TRD Off-Road', 'Limited', 'TRD Pro', 'Trailhunter'])) console.log('  Added ' + year);
}

// === Highlander (2001-2025) ===
console.log('\n=== HIGHLANDER ===');
// 1st gen (2001-2007)
for (let year = 2001; year <= 2007; year++) {
  if (addEntry(year, 'Highlander', ['Base', 'Limited', 'Sport', 'Hybrid'])) console.log('  Added ' + year);
}
// 2nd gen (2008-2013)
for (let year = 2008; year <= 2013; year++) {
  if (addEntry(year, 'Highlander', ['Base', 'SE', 'Limited', 'Plus', 'Hybrid', 'Hybrid Limited'])) console.log('  Added ' + year);
}
// 3rd gen (2014-2019)
for (let year = 2014; year <= 2019; year++) {
  if (addEntry(year, 'Highlander', ['LE', 'LE Plus', 'XLE', 'SE', 'Limited', 'Limited Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid Limited'])) console.log('  Added ' + year);
}
// 4th gen (2020-2025)
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'Highlander', ['L', 'LE', 'XLE', 'XSE', 'Limited', 'Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid Limited', 'Hybrid Platinum'])) console.log('  Added ' + year);
}

// === Prius (2001-2025) ===
console.log('\n=== PRIUS ===');
// 1st gen (2001-2003)
for (let year = 2001; year <= 2003; year++) {
  if (addEntry(year, 'Prius', ['Base'])) console.log('  Added ' + year);
}
// 2nd gen (2004-2009)
for (let year = 2004; year <= 2009; year++) {
  if (addEntry(year, 'Prius', ['Base', 'Touring'])) console.log('  Added ' + year);
}
// 3rd gen (2010-2015)
for (let year = 2010; year <= 2015; year++) {
  if (addEntry(year, 'Prius', ['Two', 'Three', 'Four', 'Five', 'Persona', 'Plug-in'])) console.log('  Added ' + year);
}
// 4th gen (2016-2022)
for (let year = 2016; year <= 2022; year++) {
  if (addEntry(year, 'Prius', ['L', 'LE', 'XLE', 'Limited', 'Prime'])) console.log('  Added ' + year);
}
// 5th gen (2023-2025)
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'Prius', ['LE', 'XLE', 'Limited', 'Prime SE', 'Prime XSE'])) console.log('  Added ' + year);
}

// === Sienna (2004-2025) ===
console.log('\n=== SIENNA ===');
// 2nd gen (2004-2010)
for (let year = 2004; year <= 2010; year++) {
  if (addEntry(year, 'Sienna', ['CE', 'LE', 'XLE', 'XLE Limited'])) console.log('  Added ' + year);
}
// 3rd gen (2011-2020)
for (let year = 2011; year <= 2020; year++) {
  if (addEntry(year, 'Sienna', ['L', 'LE', 'SE', 'XLE', 'Limited', 'SE Premium'])) console.log('  Added ' + year);
}
// 4th gen (2021-2025) - hybrid only
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'Sienna', ['LE', 'XLE', 'XSE', 'Limited', 'Platinum', 'Woodland'])) console.log('  Added ' + year);
}

// === Avalon (2000-2022) ===
console.log('\n=== AVALON ===');
// 2nd gen (2000-2004)
for (let year = 2000; year <= 2004; year++) {
  if (addEntry(year, 'Avalon', ['XL', 'XLS'])) console.log('  Added ' + year);
}
// 3rd gen (2005-2012)
for (let year = 2005; year <= 2012; year++) {
  if (addEntry(year, 'Avalon', ['XL', 'XLS', 'Touring', 'Limited'])) console.log('  Added ' + year);
}
// 4th gen (2013-2018)
for (let year = 2013; year <= 2018; year++) {
  if (addEntry(year, 'Avalon', ['XLE', 'XLE Touring', 'XLE Premium', 'Limited', 'Hybrid XLE', 'Hybrid Limited'])) console.log('  Added ' + year);
}
// 5th gen (2019-2022)
for (let year = 2019; year <= 2022; year++) {
  if (addEntry(year, 'Avalon', ['XLE', 'XSE', 'Touring', 'Limited', 'TRD', 'Hybrid XLE', 'Hybrid XSE', 'Hybrid Limited'])) console.log('  Added ' + year);
}

// === Sequoia (2001-2025) ===
console.log('\n=== SEQUOIA ===');
// 1st gen (2001-2007)
for (let year = 2001; year <= 2007; year++) {
  if (addEntry(year, 'Sequoia', ['SR5', 'Limited'])) console.log('  Added ' + year);
}
// 2nd gen (2008-2022)
for (let year = 2008; year <= 2022; year++) {
  if (addEntry(year, 'Sequoia', ['SR5', 'Limited', 'Platinum', 'TRD Sport', 'TRD Pro'])) console.log('  Added ' + year);
}
// 3rd gen (2023-2025)
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'Sequoia', ['SR5', 'Limited', 'Platinum', 'TRD Pro', 'Capstone'])) console.log('  Added ' + year);
}

// === Land Cruiser (1998-2025) ===
console.log('\n=== LAND CRUISER ===');
// 100 Series (1998-2007)
for (let year = 1998; year <= 2007; year++) {
  if (addEntry(year, 'Land Cruiser', ['Base'])) console.log('  Added ' + year);
}
// 200 Series (2008-2021)
for (let year = 2008; year <= 2021; year++) {
  if (addEntry(year, 'Land Cruiser', ['Base', 'Heritage Edition'])) console.log('  Added ' + year);
}
// 250/300 (2024-2025)
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'Land Cruiser', ['1958', 'Land Cruiser', 'First Edition'])) console.log('  Added ' + year);
}

// === Supra (2020-2025) ===
console.log('\n=== SUPRA ===');
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'Supra', ['2.0', '3.0', '3.0 Premium', 'A91 Edition'])) console.log('  Added ' + year);
}

// === GR86 (2022-2025) ===
console.log('\n=== GR86 ===');
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'GR86', ['Base', 'Premium', 'Special Edition'])) console.log('  Added ' + year);
}

// === GR Corolla (2023-2025) ===
console.log('\n=== GR COROLLA ===');
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'GR Corolla', ['Core', 'Circuit Edition', 'Morizo Edition', 'Premium'])) console.log('  Added ' + year);
}

// === Venza (2009-2015, 2021-2025) ===
console.log('\n=== VENZA ===');
// 1st gen (2009-2015)
for (let year = 2009; year <= 2015; year++) {
  if (addEntry(year, 'Venza', ['LE', 'XLE', 'Limited'])) console.log('  Added ' + year);
}
// 2nd gen (2021-2025)
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'Venza', ['LE', 'XLE', 'Limited'])) console.log('  Added ' + year);
}

// === C-HR (2018-2022) ===
console.log('\n=== C-HR ===');
for (let year = 2018; year <= 2022; year++) {
  if (addEntry(year, 'C-HR', ['LE', 'XLE', 'Limited', 'Nightshade'])) console.log('  Added ' + year);
}

// === Crown (2023-2025) ===
console.log('\n=== CROWN ===');
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'Crown', ['XLE', 'Limited', 'Platinum'])) console.log('  Added ' + year);
}

// === bZ4X (2023-2025) ===
console.log('\n=== bZ4X ===');
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'bZ4X', ['XLE', 'Limited'])) console.log('  Added ' + year);
}

// === Yaris (2007-2020) ===
console.log('\n=== YARIS ===');
for (let year = 2007; year <= 2020; year++) {
  if (addEntry(year, 'Yaris', ['Base', 'LE', 'XLE'])) console.log('  Added ' + year);
}

// === FJ Cruiser (2007-2014) ===
console.log('\n=== FJ CRUISER ===');
for (let year = 2007; year <= 2014; year++) {
  if (addEntry(year, 'FJ Cruiser', ['Base', 'Trail Teams'])) console.log('  Added ' + year);
}

// === Matrix (2003-2013) ===
console.log('\n=== MATRIX ===');
for (let year = 2003; year <= 2013; year++) {
  if (addEntry(year, 'Matrix', ['Base', 'S', 'XR', 'XRS'])) console.log('  Added ' + year);
}

// === 86 (2017-2020) ===
console.log('\n=== 86 ===');
for (let year = 2017; year <= 2020; year++) {
  if (addEntry(year, '86', ['Base', 'GT', 'TRD Special Edition'])) console.log('  Added ' + year);
}

// === Corolla Cross (2022-2025) ===
console.log('\n=== COROLLA CROSS ===');
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Corolla Cross', ['L', 'LE', 'XLE', 'SE', 'Hybrid S', 'Hybrid SE', 'Hybrid XSE'])) console.log('  Added ' + year);
}

// === Grand Highlander (2024-2025) ===
console.log('\n=== GRAND HIGHLANDER ===');
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'Grand Highlander', ['XLE', 'Limited', 'Platinum', 'Hybrid XLE', 'Hybrid Limited', 'Hybrid Max XSE', 'Hybrid Max Limited'])) console.log('  Added ' + year);
}

// === 2026 Model Year ===
console.log('\n=== 2026 MODEL YEAR ===');
const toyota2026 = {
  'Camry': ['LE', 'SE', 'XLE', 'XSE'],
  'Corolla': ['L', 'LE', 'SE', 'XLE', 'XSE', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE'],
  'RAV4': ['LE', 'XLE', 'XLE Premium', 'SE', 'XSE', 'Adventure', 'TRD Off-Road', 'Limited', 'Hybrid', 'Prime'],
  'Tacoma': ['SR', 'SR5', 'TRD Sport', 'TRD Off-Road', 'Limited', 'TRD Pro', 'Trailhunter'],
  'Tundra': ['SR', 'SR5', 'Limited', 'Platinum', 'TRD Pro', '1794 Edition', 'Capstone'],
  '4Runner': ['SR5', 'TRD Sport', 'TRD Off-Road', 'Limited', 'TRD Pro', 'Trailhunter'],
  'Highlander': ['L', 'LE', 'XLE', 'XSE', 'Limited', 'Platinum'],
  'Prius': ['LE', 'XLE', 'Limited', 'Prime SE', 'Prime XSE'],
  'Sienna': ['LE', 'XLE', 'XSE', 'Limited', 'Platinum', 'Woodland'],
  'Sequoia': ['SR5', 'Limited', 'Platinum', 'TRD Pro', 'Capstone'],
  'Land Cruiser': ['1958', 'Land Cruiser', 'First Edition'],
  'Supra': ['2.0', '3.0', '3.0 Premium', 'A91 Edition'],
  'GR86': ['Base', 'Premium', 'Special Edition'],
  'GR Corolla': ['Core', 'Circuit Edition', 'Morizo Edition', 'Premium'],
  'Venza': ['LE', 'XLE', 'Limited'],
  'Crown': ['XLE', 'Limited', 'Platinum'],
  'bZ4X': ['XLE', 'Limited'],
  'Corolla Cross': ['L', 'LE', 'XLE', 'SE', 'Hybrid S', 'Hybrid SE', 'Hybrid XSE'],
  'Grand Highlander': ['XLE', 'Limited', 'Platinum', 'Hybrid XLE', 'Hybrid Limited'],
};
Object.entries(toyota2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) console.log('  Added 2026 Toyota ' + model);
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].Toyota) {
    const sorted = {};
    Object.keys(ymmt[year].Toyota).sort().forEach(function(model) {
      sorted[model] = ymmt[year].Toyota[model];
    });
    ymmt[year].Toyota = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' Toyota YMMT entries total');
