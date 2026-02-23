const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Jeep) ymmt[yearStr].Jeep = {};
  if (!ymmt[yearStr].Jeep[model]) {
    ymmt[yearStr].Jeep[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === Grand Cherokee (1999-2025) ===
console.log('=== GRAND CHEROKEE ===');
// WJ (1999-2004)
for (let year = 1999; year <= 2004; year++) {
  if (addEntry(year, 'Grand Cherokee', ['Laredo', 'Limited', 'Overland'])) console.log('  Added ' + year);
}
// WK (2005-2010)
for (let year = 2005; year <= 2010; year++) {
  if (addEntry(year, 'Grand Cherokee', ['Laredo', 'Limited', 'Overland', 'SRT8'])) console.log('  Added ' + year);
}
// WK2 (2011-2021)
for (let year = 2011; year <= 2021; year++) {
  if (addEntry(year, 'Grand Cherokee', ['Laredo', 'Limited', 'Overland', 'Summit', 'Trailhawk', 'SRT', 'Trackhawk'])) console.log('  Added ' + year);
}
// WL (2022-2025)
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Grand Cherokee', ['Laredo', 'Limited', 'Overland', 'Summit', 'Trailhawk', 'Summit Reserve', '4xe'])) console.log('  Added ' + year);
}

// === Wrangler (1997-2025) ===
console.log('\n=== WRANGLER ===');
// TJ (1997-2006)
for (let year = 1997; year <= 2006; year++) {
  if (addEntry(year, 'Wrangler', ['SE', 'Sport', 'Sahara', 'Rubicon', 'Unlimited'])) console.log('  Added ' + year);
}
// JK (2007-2018)
for (let year = 2007; year <= 2018; year++) {
  if (addEntry(year, 'Wrangler', ['Sport', 'Sport S', 'Sahara', 'Rubicon', 'Unlimited'])) console.log('  Added ' + year);
}
// JL (2018-2025)
for (let year = 2018; year <= 2025; year++) {
  if (addEntry(year, 'Wrangler', ['Sport', 'Sport S', 'Willys', 'Sahara', 'Rubicon', '4xe', 'Rubicon 392'])) console.log('  Added ' + year);
}

// === Cherokee (2002-2023) ===
console.log('\n=== CHEROKEE ===');
// KJ Liberty was different, Cherokee KL starts 2014
// But classic XJ Cherokee
// XJ (1997-2001)
for (let year = 1997; year <= 2001; year++) {
  if (addEntry(year, 'Cherokee', ['SE', 'Sport', 'Classic', 'Limited'])) console.log('  Added ' + year);
}
// KL (2014-2023) - some exist
for (let year = 2014; year <= 2023; year++) {
  if (addEntry(year, 'Cherokee', ['Sport', 'Latitude', 'Latitude Plus', 'Limited', 'Trailhawk', 'Altitude', 'High Altitude'])) console.log('  Added ' + year);
}

// === Gladiator (2020-2025) ===
console.log('\n=== GLADIATOR ===');
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'Gladiator', ['Sport', 'Sport S', 'Willys', 'Overland', 'Rubicon', 'Mojave'])) console.log('  Added ' + year);
}

// === Compass (2007-2025) ===
console.log('\n=== COMPASS ===');
// MK (2007-2016)
for (let year = 2007; year <= 2016; year++) {
  if (addEntry(year, 'Compass', ['Sport', 'Latitude', 'Limited', 'High Altitude'])) console.log('  Added ' + year);
}
// MP (2017-2025)
for (let year = 2017; year <= 2025; year++) {
  if (addEntry(year, 'Compass', ['Sport', 'Latitude', 'Limited', 'Trailhawk', 'High Altitude'])) console.log('  Added ' + year);
}

// === Renegade (2015-2025) ===
console.log('\n=== RENEGADE ===');
for (let year = 2015; year <= 2025; year++) {
  if (addEntry(year, 'Renegade', ['Sport', 'Latitude', 'Limited', 'Trailhawk', 'Altitude', 'Upland'])) console.log('  Added ' + year);
}

// === Wagoneer (2022-2025) ===
console.log('\n=== WAGONEER ===');
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Wagoneer', ['Series I', 'Series II', 'Series III'])) console.log('  Added ' + year);
}

// === Grand Wagoneer (2022-2025) ===
console.log('\n=== GRAND WAGONEER ===');
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Grand Wagoneer', ['Series I', 'Series II', 'Series III', 'Obsidian'])) console.log('  Added ' + year);
}

// === Commander (2006-2010) ===
console.log('\n=== COMMANDER ===');
for (let year = 2006; year <= 2010; year++) {
  if (addEntry(year, 'Commander', ['Sport', 'Limited', 'Overland'])) console.log('  Added ' + year);
}

// === Liberty (2002-2012) ===
console.log('\n=== LIBERTY ===');
// KJ (2002-2007)
for (let year = 2002; year <= 2007; year++) {
  if (addEntry(year, 'Liberty', ['Sport', 'Limited', 'Renegade'])) console.log('  Added ' + year);
}
// KK (2008-2012)
for (let year = 2008; year <= 2012; year++) {
  if (addEntry(year, 'Liberty', ['Sport', 'Limited', 'Jet', 'Arctic'])) console.log('  Added ' + year);
}

// === Patriot (2007-2017) ===
console.log('\n=== PATRIOT ===');
for (let year = 2007; year <= 2017; year++) {
  if (addEntry(year, 'Patriot', ['Sport', 'Latitude', 'Limited', 'High Altitude'])) console.log('  Added ' + year);
}

// === Grand Cherokee L (2021-2025) ===
console.log('\n=== GRAND CHEROKEE L ===');
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'Grand Cherokee L', ['Laredo', 'Limited', 'Overland', 'Summit', 'Summit Reserve'])) console.log('  Added ' + year);
}

// === 2026 Model Year ===
console.log('\n=== 2026 MODEL YEAR ===');
const jeep2026 = {
  'Grand Cherokee': ['Laredo', 'Limited', 'Overland', 'Summit', 'Trailhawk', 'Summit Reserve', '4xe'],
  'Grand Cherokee L': ['Laredo', 'Limited', 'Overland', 'Summit', 'Summit Reserve'],
  'Wrangler': ['Sport', 'Sport S', 'Willys', 'Sahara', 'Rubicon', '4xe'],
  'Gladiator': ['Sport', 'Sport S', 'Willys', 'Overland', 'Rubicon', 'Mojave'],
  'Compass': ['Sport', 'Latitude', 'Limited', 'Trailhawk', 'High Altitude'],
  'Renegade': ['Sport', 'Latitude', 'Limited', 'Trailhawk'],
  'Wagoneer': ['Series I', 'Series II', 'Series III'],
  'Grand Wagoneer': ['Series I', 'Series II', 'Series III', 'Obsidian'],
};
Object.entries(jeep2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) console.log('  Added 2026 Jeep ' + model);
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].Jeep) {
    const sorted = {};
    Object.keys(ymmt[year].Jeep).sort().forEach(function(model) {
      sorted[model] = ymmt[year].Jeep[model];
    });
    ymmt[year].Jeep = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' Jeep YMMT entries total');
