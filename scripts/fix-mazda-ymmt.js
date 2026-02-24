const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Mazda) ymmt[yearStr].Mazda = {};
  if (!ymmt[yearStr].Mazda[model]) {
    ymmt[yearStr].Mazda[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === Mazda3 (2004-2025) ===
console.log('=== MAZDA3 ===');
// 1st gen (2004-2009)
for (let year = 2004; year <= 2009; year++) {
  if (addEntry(year, 'Mazda3', ['i Sport', 'i Touring', 's Sport', 's Touring', 's Grand Touring'])) console.log('  Added ' + year);
}
// 2nd gen (2010-2013)
for (let year = 2010; year <= 2013; year++) {
  if (addEntry(year, 'Mazda3', ['i SV', 'i Sport', 'i Touring', 'i Grand Touring', 's Sport', 's Touring', 's Grand Touring'])) console.log('  Added ' + year);
}
// 3rd gen (2014-2018)
for (let year = 2014; year <= 2018; year++) {
  if (addEntry(year, 'Mazda3', ['i Sport', 'i Touring', 'i Grand Touring', 's Sport', 's Touring', 's Grand Touring'])) console.log('  Added ' + year);
}
// 4th gen (2019-2025)
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, 'Mazda3', ['Base', 'Select', 'Preferred', 'Premium', 'Carbon Edition', 'Turbo', 'Turbo Premium Plus'])) console.log('  Added ' + year);
}

// === Mazda6 (2003-2021) ===
console.log('\n=== MAZDA6 ===');
// 1st gen (2003-2008)
for (let year = 2003; year <= 2008; year++) {
  if (addEntry(year, 'Mazda6', ['i Sport', 'i Touring', 's Sport', 's Touring', 's Grand Touring'])) console.log('  Added ' + year);
}
// 2nd gen (2009-2013)
for (let year = 2009; year <= 2013; year++) {
  if (addEntry(year, 'Mazda6', ['i Sport', 'i Touring', 'i Grand Touring', 's Sport', 's Touring', 's Grand Touring'])) console.log('  Added ' + year);
}
// 3rd gen (2014-2021)
for (let year = 2014; year <= 2021; year++) {
  if (addEntry(year, 'Mazda6', ['Sport', 'Touring', 'Grand Touring', 'Grand Touring Reserve', 'Signature', 'Carbon Edition'])) console.log('  Added ' + year);
}

// === CX-5 (2013-2025) - already have 2013-2023, add 2024-2025 ===
console.log('\n=== CX-5 ===');
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'CX-5', ['S', 'S Select', 'S Preferred', 'S Premium', 'S Carbon Edition', 'Turbo', 'Turbo Signature'])) console.log('  Added ' + year);
}

// === CX-9 (2007-2023) ===
console.log('\n=== CX-9 ===');
// 1st gen (2007-2015)
for (let year = 2007; year <= 2015; year++) {
  if (addEntry(year, 'CX-9', ['Sport', 'Touring', 'Grand Touring'])) console.log('  Added ' + year);
}
// 2nd gen (2016-2023)
for (let year = 2016; year <= 2023; year++) {
  if (addEntry(year, 'CX-9', ['Sport', 'Touring', 'Grand Touring', 'Carbon Edition', 'Signature'])) console.log('  Added ' + year);
}

// === CX-30 (2020-2025) ===
console.log('\n=== CX-30 ===');
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'CX-30', ['Base', 'Select', 'Preferred', 'Premium', 'Carbon Edition', 'Turbo', 'Turbo Premium Plus'])) console.log('  Added ' + year);
}

// === CX-50 (2023-2025) ===
console.log('\n=== CX-50 ===');
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'CX-50', ['S', 'S Select', 'S Preferred', 'S Preferred Plus', 'S Premium', 'S Premium Plus', 'Turbo', 'Turbo Premium', 'Turbo Premium Plus', 'Turbo Meridian'])) console.log('  Added ' + year);
}

// === CX-90 (2024-2025) ===
console.log('\n=== CX-90 ===');
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'CX-90', ['Select', 'Preferred', 'Preferred Plus', 'Premium', 'Premium Plus', 'PHEV Premium', 'PHEV Premium Plus'])) console.log('  Added ' + year);
}

// === MX-5 Miata (1990-2025) ===
console.log('\n=== MX-5 MIATA ===');
// NA (1990-1997)
for (let year = 1990; year <= 1997; year++) {
  if (addEntry(year, 'MX-5 Miata', ['Base', 'LE', 'M Edition', 'STO'])) console.log('  Added ' + year);
}
// NB (1999-2005)
for (let year = 1999; year <= 2005; year++) {
  if (addEntry(year, 'MX-5 Miata', ['Base', 'LS', 'SE', 'Mazdaspeed'])) console.log('  Added ' + year);
}
// NC (2006-2015)
for (let year = 2006; year <= 2015; year++) {
  if (addEntry(year, 'MX-5 Miata', ['Sport', 'Touring', 'Grand Touring', 'Club', 'Special Edition'])) console.log('  Added ' + year);
}
// ND (2016-2025)
for (let year = 2016; year <= 2025; year++) {
  if (addEntry(year, 'MX-5 Miata', ['Sport', 'Club', 'Grand Touring', 'RF'])) console.log('  Added ' + year);
}

// === RX-8 (2004-2012) ===
console.log('\n=== RX-8 ===');
for (let year = 2004; year <= 2012; year++) {
  if (addEntry(year, 'RX-8', ['Base', 'Sport', 'Touring', 'Grand Touring', 'R3'])) console.log('  Added ' + year);
}

// === CX-3 (2016-2022) ===
console.log('\n=== CX-3 ===');
for (let year = 2016; year <= 2022; year++) {
  if (addEntry(year, 'CX-3', ['Sport', 'Touring', 'Grand Touring'])) console.log('  Added ' + year);
}

// === Mazda5 (2006-2015) ===
console.log('\n=== MAZDA5 ===');
for (let year = 2006; year <= 2015; year++) {
  if (addEntry(year, 'Mazda5', ['Sport', 'Touring', 'Grand Touring'])) console.log('  Added ' + year);
}

// === Mazda2 (2011-2014) ===
console.log('\n=== MAZDA2 ===');
for (let year = 2011; year <= 2014; year++) {
  if (addEntry(year, 'Mazda2', ['Sport', 'Touring'])) console.log('  Added ' + year);
}

// === CX-7 (2007-2012) ===
console.log('\n=== CX-7 ===');
for (let year = 2007; year <= 2012; year++) {
  if (addEntry(year, 'CX-7', ['Sport', 'Touring', 'Grand Touring', 'i Sport', 'i Touring', 's Touring', 's Grand Touring'])) console.log('  Added ' + year);
}

// === CX-70 (2025) ===
console.log('\n=== CX-70 ===');
if (addEntry(2025, 'CX-70', ['Select', 'Preferred', 'Preferred Plus', 'Premium', 'Premium Plus', 'PHEV Premium', 'PHEV Premium Plus'])) console.log('  Added 2025');

// === CX-80 (2025) ===
console.log('\n=== CX-80 ===');
// CX-80 is not yet sold in US, skip

// === 2026 Model Year ===
console.log('\n=== 2026 MODEL YEAR ===');
const mazda2026 = {
  'Mazda3': ['Base', 'Select', 'Preferred', 'Premium', 'Carbon Edition', 'Turbo', 'Turbo Premium Plus'],
  'CX-5': ['S', 'S Select', 'S Preferred', 'S Premium', 'S Carbon Edition', 'Turbo', 'Turbo Signature'],
  'CX-30': ['Base', 'Select', 'Preferred', 'Premium', 'Carbon Edition', 'Turbo', 'Turbo Premium Plus'],
  'CX-50': ['S', 'S Select', 'S Preferred', 'S Preferred Plus', 'S Premium', 'S Premium Plus', 'Turbo', 'Turbo Premium', 'Turbo Premium Plus', 'Turbo Meridian'],
  'CX-90': ['Select', 'Preferred', 'Preferred Plus', 'Premium', 'Premium Plus', 'PHEV Premium', 'PHEV Premium Plus'],
  'MX-5 Miata': ['Sport', 'Club', 'Grand Touring', 'RF'],
  'CX-70': ['Select', 'Preferred', 'Preferred Plus', 'Premium', 'Premium Plus', 'PHEV Premium', 'PHEV Premium Plus'],
};
Object.entries(mazda2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) console.log('  Added 2026 Mazda ' + model);
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].Mazda) {
    const sorted = {};
    Object.keys(ymmt[year].Mazda).sort().forEach(function(model) {
      sorted[model] = ymmt[year].Mazda[model];
    });
    ymmt[year].Mazda = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' Mazda YMMT entries total');
