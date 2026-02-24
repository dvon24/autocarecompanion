const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Nissan) ymmt[yearStr].Nissan = {};
  if (!ymmt[yearStr].Nissan[model]) {
    ymmt[yearStr].Nissan[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === Altima (2002-2025) ===
console.log('=== ALTIMA ===');
// 3rd gen (2002-2006)
for (let year = 2002; year <= 2006; year++) {
  if (addEntry(year, 'Altima', ['2.5 S', '2.5 SL', '3.5 SE', '3.5 SL'])) console.log('  Added ' + year);
}
// 4th gen (2007-2012)
for (let year = 2007; year <= 2012; year++) {
  if (addEntry(year, 'Altima', ['2.5 S', '2.5 SL', '3.5 SR', '3.5 SV', 'Hybrid'])) console.log('  Added ' + year);
}
// 5th gen (2013-2018)
for (let year = 2013; year <= 2018; year++) {
  if (addEntry(year, 'Altima', ['2.5 S', '2.5 SV', '2.5 SL', '3.5 SR', '3.5 SL'])) console.log('  Added ' + year);
}
// 6th gen (2019-2025)
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, 'Altima', ['S', 'SV', 'SR', 'SL', 'Platinum'])) console.log('  Added ' + year);
}

// === Sentra (2000-2025) ===
console.log('\n=== SENTRA ===');
// 5th gen (2000-2006)
for (let year = 2000; year <= 2006; year++) {
  if (addEntry(year, 'Sentra', ['XE', 'GXE', 'SE', 'SE-R', 'SE-R Spec V'])) console.log('  Added ' + year);
}
// 6th gen (2007-2012)
for (let year = 2007; year <= 2012; year++) {
  if (addEntry(year, 'Sentra', ['2.0', '2.0 S', '2.0 SL', 'SE-R', 'SE-R Spec V'])) console.log('  Added ' + year);
}
// 7th gen (2013-2019)
for (let year = 2013; year <= 2019; year++) {
  if (addEntry(year, 'Sentra', ['S', 'SV', 'SR', 'SL', 'NISMO'])) console.log('  Added ' + year);
}
// 8th gen (2020-2025)
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'Sentra', ['S', 'SV', 'SR', 'SL'])) console.log('  Added ' + year);
}

// === Rogue (2008-2025) ===
console.log('\n=== ROGUE ===');
// 1st gen (2008-2013)
for (let year = 2008; year <= 2013; year++) {
  if (addEntry(year, 'Rogue', ['S', 'SV', 'SL', 'Select'])) console.log('  Added ' + year);
}
// 2nd gen (2014-2020)
for (let year = 2014; year <= 2020; year++) {
  if (addEntry(year, 'Rogue', ['S', 'SV', 'SL', 'Platinum'])) console.log('  Added ' + year);
}
// 3rd gen (2021-2025)
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'Rogue', ['S', 'SV', 'SL', 'Platinum'])) console.log('  Added ' + year);
}

// === Pathfinder (2005-2025) ===
console.log('\n=== PATHFINDER ===');
// 3rd gen (2005-2012)
for (let year = 2005; year <= 2012; year++) {
  if (addEntry(year, 'Pathfinder', ['S', 'SE', 'LE', 'Silver Edition'])) console.log('  Added ' + year);
}
// 4th gen (2013-2020)
for (let year = 2013; year <= 2020; year++) {
  if (addEntry(year, 'Pathfinder', ['S', 'SV', 'SL', 'Platinum'])) console.log('  Added ' + year);
}
// 5th gen (2022-2025)
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Pathfinder', ['S', 'SV', 'SL', 'Platinum', 'Rock Creek'])) console.log('  Added ' + year);
}

// === Murano (2003-2024) ===
console.log('\n=== MURANO ===');
// 1st gen (2003-2007)
for (let year = 2003; year <= 2007; year++) {
  if (addEntry(year, 'Murano', ['S', 'SL', 'SE'])) console.log('  Added ' + year);
}
// 2nd gen (2009-2014)
for (let year = 2009; year <= 2014; year++) {
  if (addEntry(year, 'Murano', ['S', 'SV', 'SL', 'LE', 'CrossCabriolet'])) console.log('  Added ' + year);
}
// 3rd gen (2015-2024)
for (let year = 2015; year <= 2024; year++) {
  if (addEntry(year, 'Murano', ['S', 'SV', 'SL', 'Platinum'])) console.log('  Added ' + year);
}

// === Maxima (2004-2023) ===
console.log('\n=== MAXIMA ===');
// 6th gen (2004-2008)
for (let year = 2004; year <= 2008; year++) {
  if (addEntry(year, 'Maxima', ['SE', 'SL'])) console.log('  Added ' + year);
}
// 7th gen (2009-2014)
for (let year = 2009; year <= 2014; year++) {
  if (addEntry(year, 'Maxima', ['S', 'SV', 'Premium'])) console.log('  Added ' + year);
}
// 8th gen (2016-2023)
for (let year = 2016; year <= 2023; year++) {
  if (addEntry(year, 'Maxima', ['S', 'SV', 'SR', 'SL', 'Platinum'])) console.log('  Added ' + year);
}

// === Frontier (2005-2025) ===
console.log('\n=== FRONTIER ===');
// 2nd gen (2005-2021)
for (let year = 2005; year <= 2021; year++) {
  if (addEntry(year, 'Frontier', ['S', 'SV', 'SL', 'PRO-4X', 'Desert Runner'])) console.log('  Added ' + year);
}
// 3rd gen (2022-2025)
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Frontier', ['S', 'SV', 'PRO-4X', 'PRO-X'])) console.log('  Added ' + year);
}

// === Titan (2004-2025) ===
console.log('\n=== TITAN ===');
// 1st gen (2004-2015)
for (let year = 2004; year <= 2015; year++) {
  if (addEntry(year, 'Titan', ['S', 'SV', 'SL', 'PRO-4X'])) console.log('  Added ' + year);
}
// 2nd gen (2016-2025)
for (let year = 2016; year <= 2025; year++) {
  if (addEntry(year, 'Titan', ['S', 'SV', 'SL', 'PRO-4X', 'Platinum Reserve', 'XD'])) console.log('  Added ' + year);
}

// === Kicks (2018-2025) ===
console.log('\n=== KICKS ===');
for (let year = 2018; year <= 2025; year++) {
  if (addEntry(year, 'Kicks', ['S', 'SV', 'SR'])) console.log('  Added ' + year);
}

// === Versa (2007-2025) ===
console.log('\n=== VERSA ===');
// 1st gen (2007-2011)
for (let year = 2007; year <= 2011; year++) {
  if (addEntry(year, 'Versa', ['S', 'SL'])) console.log('  Added ' + year);
}
// 2nd gen (2012-2019)
for (let year = 2012; year <= 2019; year++) {
  if (addEntry(year, 'Versa', ['S', 'S Plus', 'SV', 'SL', 'Note'])) console.log('  Added ' + year);
}
// 3rd gen (2020-2025)
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'Versa', ['S', 'SV', 'SR'])) console.log('  Added ' + year);
}

// === Armada (2004-2025) ===
console.log('\n=== ARMADA ===');
// 1st gen (2004-2015)
for (let year = 2004; year <= 2015; year++) {
  if (addEntry(year, 'Armada', ['SE', 'SV', 'SL', 'Platinum'])) console.log('  Added ' + year);
}
// 2nd gen (2017-2025)
for (let year = 2017; year <= 2025; year++) {
  if (addEntry(year, 'Armada', ['SV', 'SL', 'Platinum', 'Midnight Edition'])) console.log('  Added ' + year);
}

// === Leaf (2011-2024) ===
console.log('\n=== LEAF ===');
// 1st gen (2011-2017)
for (let year = 2011; year <= 2017; year++) {
  if (addEntry(year, 'Leaf', ['S', 'SV', 'SL'])) console.log('  Added ' + year);
}
// 2nd gen (2018-2024)
for (let year = 2018; year <= 2024; year++) {
  if (addEntry(year, 'Leaf', ['S', 'SV', 'SL Plus', 'S Plus'])) console.log('  Added ' + year);
}

// === Z / 370Z (2009-2020 already exists, add 350Z and 400Z) ===
console.log('\n=== 350Z ===');
for (let year = 2003; year <= 2009; year++) {
  if (addEntry(year, '350Z', ['Base', 'Enthusiast', 'Performance', 'Touring', 'Grand Touring', 'Track', 'NISMO'])) console.log('  Added ' + year);
}

console.log('\n=== Z (400Z) ===');
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'Z', ['Sport', 'Performance', 'NISMO'])) console.log('  Added ' + year);
}

// === Juke (2011-2017) ===
console.log('\n=== JUKE ===');
for (let year = 2011; year <= 2017; year++) {
  if (addEntry(year, 'Juke', ['S', 'SV', 'SL', 'NISMO', 'NISMO RS'])) console.log('  Added ' + year);
}

// === Quest (2004-2017) ===
console.log('\n=== QUEST ===');
// 3rd gen (2004-2009)
for (let year = 2004; year <= 2009; year++) {
  if (addEntry(year, 'Quest', ['3.5 S', '3.5 SE', '3.5 SL'])) console.log('  Added ' + year);
}
// 4th gen (2011-2017)
for (let year = 2011; year <= 2017; year++) {
  if (addEntry(year, 'Quest', ['S', 'SV', 'SL', 'LE', 'Platinum'])) console.log('  Added ' + year);
}

// === Xterra (2000-2015) ===
console.log('\n=== XTERRA ===');
// 1st gen (2000-2004)
for (let year = 2000; year <= 2004; year++) {
  if (addEntry(year, 'Xterra', ['XE', 'SE', 'SE SC'])) console.log('  Added ' + year);
}
// 2nd gen (2005-2015)
for (let year = 2005; year <= 2015; year++) {
  if (addEntry(year, 'Xterra', ['S', 'X', 'OFF-ROAD', 'PRO-4X'])) console.log('  Added ' + year);
}

// === GT-R (2009-2024) ===
console.log('\n=== GT-R ===');
for (let year = 2009; year <= 2024; year++) {
  if (addEntry(year, 'GT-R', ['Premium', 'Track Edition', 'NISMO', 'T-spec'])) console.log('  Added ' + year);
}

// === Rogue Sport / Rogue Select ===
console.log('\n=== ROGUE SPORT ===');
for (let year = 2017; year <= 2022; year++) {
  if (addEntry(year, 'Rogue Sport', ['S', 'SV', 'SL'])) console.log('  Added ' + year);
}

// === Ariya (2023-2025) ===
console.log('\n=== ARIYA ===');
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'Ariya', ['Engage', 'Venture+', 'Evolve+', 'Empower+', 'Platinum+'])) console.log('  Added ' + year);
}

// === 2026 Model Year ===
console.log('\n=== 2026 MODEL YEAR ===');
const nissan2026 = {
  'Altima': ['S', 'SV', 'SR', 'SL', 'Platinum'],
  'Sentra': ['S', 'SV', 'SR', 'SL'],
  'Rogue': ['S', 'SV', 'SL', 'Platinum'],
  'Pathfinder': ['S', 'SV', 'SL', 'Platinum', 'Rock Creek'],
  'Frontier': ['S', 'SV', 'PRO-4X', 'PRO-X'],
  'Titan': ['S', 'SV', 'SL', 'PRO-4X', 'Platinum Reserve'],
  'Kicks': ['S', 'SV', 'SR'],
  'Versa': ['S', 'SV', 'SR'],
  'Armada': ['SV', 'SL', 'Platinum', 'Midnight Edition'],
  'Z': ['Sport', 'Performance', 'NISMO'],
  'Ariya': ['Engage', 'Venture+', 'Evolve+', 'Empower+', 'Platinum+'],
};
Object.entries(nissan2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) console.log('  Added 2026 Nissan ' + model);
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].Nissan) {
    const sorted = {};
    Object.keys(ymmt[year].Nissan).sort().forEach(function(model) {
      sorted[model] = ymmt[year].Nissan[model];
    });
    ymmt[year].Nissan = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' Nissan YMMT entries total');
