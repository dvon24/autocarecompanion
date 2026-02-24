const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Subaru) ymmt[yearStr].Subaru = {};
  if (!ymmt[yearStr].Subaru[model]) {
    ymmt[yearStr].Subaru[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === Forester (1998-2025) ===
console.log('=== FORESTER ===');
// 1st gen (1998-2002)
for (let year = 1998; year <= 2002; year++) {
  if (addEntry(year, 'Forester', ['L', 'S'])) console.log('  Added ' + year);
}
// 2nd gen (2003-2008)
for (let year = 2003; year <= 2008; year++) {
  if (addEntry(year, 'Forester', ['2.5 X', '2.5 XS', '2.5 XT', 'Sports 2.5 X'])) console.log('  Added ' + year);
}
// 3rd gen (2009-2013)
for (let year = 2009; year <= 2013; year++) {
  if (addEntry(year, 'Forester', ['2.5 X', '2.5 X Premium', '2.5 X Limited', '2.5 XT', '2.5 XT Touring'])) console.log('  Added ' + year);
}
// 4th gen (2014-2018)
for (let year = 2014; year <= 2018; year++) {
  if (addEntry(year, 'Forester', ['2.5i', '2.5i Premium', '2.5i Limited', '2.5i Touring', '2.0XT Premium', '2.0XT Touring'])) console.log('  Added ' + year);
}
// 5th gen (2019-2025)
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, 'Forester', ['Base', 'Premium', 'Sport', 'Limited', 'Touring', 'Wilderness'])) console.log('  Added ' + year);
}

// === Outback (2000-2025) ===
console.log('\n=== OUTBACK ===');
// 3rd gen (2005-2009)
for (let year = 2005; year <= 2009; year++) {
  if (addEntry(year, 'Outback', ['2.5i', '2.5i Limited', '2.5 XT', '2.5 XT Limited', '3.0R', '3.0R L.L. Bean'])) console.log('  Added ' + year);
}
// 4th gen (2010-2014)
for (let year = 2010; year <= 2014; year++) {
  if (addEntry(year, 'Outback', ['2.5i', '2.5i Premium', '2.5i Limited', '3.6R', '3.6R Limited', '3.6R Premium'])) console.log('  Added ' + year);
}
// 5th gen (2015-2019)
for (let year = 2015; year <= 2019; year++) {
  if (addEntry(year, 'Outback', ['2.5i', '2.5i Premium', '2.5i Limited', '2.5i Touring', '3.6R', '3.6R Touring'])) console.log('  Added ' + year);
}
// 6th gen (2020-2025)
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'Outback', ['Base', 'Premium', 'Onyx Edition XT', 'Limited', 'Touring', 'Touring XT', 'Wilderness'])) console.log('  Added ' + year);
}

// === Crosstrek (2013-2025) ===
console.log('\n=== CROSSTREK ===');
// 1st gen (2013-2017) - was XV Crosstrek in 2013-2015
for (let year = 2013; year <= 2017; year++) {
  if (addEntry(year, 'Crosstrek', ['2.0i', '2.0i Premium', '2.0i Limited', 'Hybrid'])) console.log('  Added ' + year);
}
// 2nd gen (2018-2023)
for (let year = 2018; year <= 2023; year++) {
  if (addEntry(year, 'Crosstrek', ['Base', 'Premium', 'Sport', 'Limited', 'Hybrid'])) console.log('  Added ' + year);
}
// 3rd gen (2024-2025)
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'Crosstrek', ['Base', 'Premium', 'Sport', 'Limited', 'Wilderness'])) console.log('  Added ' + year);
}

// === Impreza (2002-2025) ===
console.log('\n=== IMPREZA ===');
// 2nd gen (2002-2007)
for (let year = 2002; year <= 2007; year++) {
  if (addEntry(year, 'Impreza', ['2.5 RS', '2.5 TS', 'Outback Sport', 'WRX', 'WRX STI'])) console.log('  Added ' + year);
}
// 3rd gen (2008-2014)
for (let year = 2008; year <= 2014; year++) {
  if (addEntry(year, 'Impreza', ['2.0i', '2.0i Premium', '2.0i Limited', '2.0i Sport Premium', 'WRX', 'WRX STI'])) console.log('  Added ' + year);
}
// 4th gen (2012-2016) - overlap handled by addEntry check
// 5th gen (2017-2023)
for (let year = 2017; year <= 2023; year++) {
  if (addEntry(year, 'Impreza', ['Base', 'Premium', 'Sport', 'Limited'])) console.log('  Added ' + year);
}
// 6th gen (2024-2025)
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'Impreza', ['Base', 'Sport', 'RS'])) console.log('  Added ' + year);
}

// === Legacy (2000-2024) ===
console.log('\n=== LEGACY ===');
// 3rd gen (2000-2004)
for (let year = 2000; year <= 2004; year++) {
  if (addEntry(year, 'Legacy', ['L', 'GT', 'GT Limited'])) console.log('  Added ' + year);
}
// 4th gen (2005-2009)
for (let year = 2005; year <= 2009; year++) {
  if (addEntry(year, 'Legacy', ['2.5i', '2.5i Limited', '2.5 GT', '2.5 GT spec.B', '3.0R', '3.0R Limited'])) console.log('  Added ' + year);
}
// 5th gen (2010-2014)
for (let year = 2010; year <= 2014; year++) {
  if (addEntry(year, 'Legacy', ['2.5i', '2.5i Premium', '2.5i Limited', '3.6R', '3.6R Limited'])) console.log('  Added ' + year);
}
// 6th gen (2015-2019)
for (let year = 2015; year <= 2019; year++) {
  if (addEntry(year, 'Legacy', ['2.5i', '2.5i Premium', '2.5i Limited', '3.6R'])) console.log('  Added ' + year);
}
// 7th gen (2020-2024)
for (let year = 2020; year <= 2024; year++) {
  if (addEntry(year, 'Legacy', ['Base', 'Premium', 'Sport', 'Limited', 'Touring XT'])) console.log('  Added ' + year);
}

// === WRX (2002-2025) - already has YMMT entries, extend ===
console.log('\n=== WRX ===');
for (let year = 2002; year <= 2014; year++) {
  if (addEntry(year, 'WRX', ['Base', 'Premium', 'Limited', 'STI'])) console.log('  Added ' + year);
}
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'WRX', ['Base', 'Premium', 'Limited', 'GT', 'tS'])) console.log('  Added ' + year);
}

// === WRX STI (2004-2021) ===
console.log('\n=== WRX STI ===');
for (let year = 2004; year <= 2014; year++) {
  if (addEntry(year, 'WRX STI', ['Base', 'Limited', 'Special Edition'])) console.log('  Added ' + year);
}

// === Ascent (2019-2025) ===
console.log('\n=== ASCENT ===');
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, 'Ascent', ['Base', 'Premium', 'Limited', 'Touring', 'Onyx Edition'])) console.log('  Added ' + year);
}

// === BRZ (2013-2025) ===
console.log('\n=== BRZ ===');
// 1st gen (2013-2020)
for (let year = 2013; year <= 2020; year++) {
  if (addEntry(year, 'BRZ', ['Premium', 'Limited', 'tS', 'Series.Yellow'])) console.log('  Added ' + year);
}
// 2nd gen (2022-2025)
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'BRZ', ['Premium', 'Limited', 'tS'])) console.log('  Added ' + year);
}

// === Solterra (2023-2025) ===
console.log('\n=== SOLTERRA ===');
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'Solterra', ['Premium', 'Limited', 'Touring'])) console.log('  Added ' + year);
}

// === Baja (2003-2006) ===
console.log('\n=== BAJA ===');
for (let year = 2003; year <= 2006; year++) {
  if (addEntry(year, 'Baja', ['Sport', 'Turbo'])) console.log('  Added ' + year);
}

// === Tribeca (2006-2014) ===
console.log('\n=== TRIBECA ===');
for (let year = 2006; year <= 2014; year++) {
  if (addEntry(year, 'Tribeca', ['Base', 'Premium', 'Limited', 'Touring'])) console.log('  Added ' + year);
}

// === 2026 Model Year ===
console.log('\n=== 2026 MODEL YEAR ===');
const subaru2026 = {
  'Forester': ['Base', 'Premium', 'Sport', 'Limited', 'Touring', 'Wilderness'],
  'Outback': ['Base', 'Premium', 'Onyx Edition XT', 'Limited', 'Touring', 'Touring XT', 'Wilderness'],
  'Crosstrek': ['Base', 'Premium', 'Sport', 'Limited', 'Wilderness'],
  'Impreza': ['Base', 'Sport', 'RS'],
  'WRX': ['Base', 'Premium', 'Limited', 'GT', 'tS'],
  'Ascent': ['Base', 'Premium', 'Limited', 'Touring', 'Onyx Edition'],
  'BRZ': ['Premium', 'Limited', 'tS'],
  'Solterra': ['Premium', 'Limited', 'Touring'],
};
Object.entries(subaru2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) console.log('  Added 2026 Subaru ' + model);
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].Subaru) {
    const sorted = {};
    Object.keys(ymmt[year].Subaru).sort().forEach(function(model) {
      sorted[model] = ymmt[year].Subaru[model];
    });
    ymmt[year].Subaru = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' Subaru YMMT entries total');
