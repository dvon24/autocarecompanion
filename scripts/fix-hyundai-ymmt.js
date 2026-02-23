const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Hyundai) ymmt[yearStr].Hyundai = {};
  if (!ymmt[yearStr].Hyundai[model]) {
    ymmt[yearStr].Hyundai[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === Sonata (2006-2025) ===
console.log('=== SONATA ===');
// NF (2006-2010)
for (let year = 2006; year <= 2010; year++) {
  if (addEntry(year, 'Sonata', ['GLS', 'SE', 'Limited'])) console.log('  Added ' + year);
}
// YF (2011-2014)
for (let year = 2011; year <= 2014; year++) {
  if (addEntry(year, 'Sonata', ['GLS', 'SE', 'Limited', 'Hybrid'])) console.log('  Added ' + year);
}
// LF (2015-2019)
for (let year = 2015; year <= 2019; year++) {
  if (addEntry(year, 'Sonata', ['SE', 'Sport', 'ECO', 'Limited', 'Hybrid'])) console.log('  Added ' + year);
}
// DN8 (2020-2025)
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'Sonata', ['SE', 'SEL', 'SEL Plus', 'Limited', 'N Line', 'Hybrid'])) console.log('  Added ' + year);
}

// === Elantra (2007-2025) ===
console.log('\n=== ELANTRA ===');
// HD (2007-2010)
for (let year = 2007; year <= 2010; year++) {
  if (addEntry(year, 'Elantra', ['GLS', 'SE', 'Blue'])) console.log('  Added ' + year);
}
// MD (2011-2016)
for (let year = 2011; year <= 2016; year++) {
  if (addEntry(year, 'Elantra', ['GLS', 'SE', 'Sport', 'Limited'])) console.log('  Added ' + year);
}
// AD (2017-2020)
for (let year = 2017; year <= 2020; year++) {
  if (addEntry(year, 'Elantra', ['SE', 'SEL', 'Value Edition', 'Limited', 'Sport', 'GT'])) console.log('  Added ' + year);
}
// CN7 (2021-2025)
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'Elantra', ['SE', 'SEL', 'Limited', 'N Line', 'N', 'Hybrid'])) console.log('  Added ' + year);
}

// === Tucson (2005-2025) ===
console.log('\n=== TUCSON ===');
// JM (2005-2009)
for (let year = 2005; year <= 2009; year++) {
  if (addEntry(year, 'Tucson', ['GLS', 'SE', 'Limited'])) console.log('  Added ' + year);
}
// LM/ix35 (2010-2015)
for (let year = 2010; year <= 2015; year++) {
  if (addEntry(year, 'Tucson', ['GLS', 'GL', 'Limited', 'SE'])) console.log('  Added ' + year);
}
// TL (2016-2021)
for (let year = 2016; year <= 2021; year++) {
  if (addEntry(year, 'Tucson', ['SE', 'SEL', 'Sport', 'Limited', 'Ultimate', 'Value', 'Night'])) console.log('  Added ' + year);
}
// NX4 (2022-2025)
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Tucson', ['SE', 'SEL', 'N Line', 'XRT', 'Limited', 'Hybrid', 'PHEV'])) console.log('  Added ' + year);
}

// === Santa Fe (2001-2025) ===
console.log('\n=== SANTA FE ===');
// SM (2001-2006)
for (let year = 2001; year <= 2006; year++) {
  if (addEntry(year, 'Santa Fe', ['GLS', 'LX', 'Limited'])) console.log('  Added ' + year);
}
// CM (2007-2012)
for (let year = 2007; year <= 2012; year++) {
  if (addEntry(year, 'Santa Fe', ['GLS', 'SE', 'Limited'])) console.log('  Added ' + year);
}
// DM (2013-2018)
for (let year = 2013; year <= 2018; year++) {
  if (addEntry(year, 'Santa Fe', ['Sport', 'SE', 'Limited', 'Ultimate'])) console.log('  Added ' + year);
}
// TM (2019-2024)
for (let year = 2019; year <= 2024; year++) {
  if (addEntry(year, 'Santa Fe', ['SE', 'SEL', 'Limited', 'Calligraphy', 'Hybrid', 'PHEV'])) console.log('  Added ' + year);
}
// MX5 (2025)
if (addEntry(2025, 'Santa Fe', ['SE', 'SEL', 'XRT', 'Limited', 'Calligraphy', 'Hybrid'])) console.log('  Added 2025');

// === Kona (2018-2025) ===
console.log('\n=== KONA ===');
// OS (2018-2023)
for (let year = 2018; year <= 2023; year++) {
  if (addEntry(year, 'Kona', ['SE', 'SEL', 'N Line', 'Limited', 'Electric'])) console.log('  Added ' + year);
}
// SX2 (2024-2025)
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'Kona', ['SE', 'SEL', 'N Line', 'Limited', 'Electric'])) console.log('  Added ' + year);
}

// === Palisade (2020-2025) ===
console.log('\n=== PALISADE ===');
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'Palisade', ['SE', 'SEL', 'Limited', 'Calligraphy'])) console.log('  Added ' + year);
}

// === Santa Cruz (2022-2025) ===
console.log('\n=== SANTA CRUZ ===');
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Santa Cruz', ['SE', 'SEL', 'SEL Premium', 'Limited', 'Night'])) console.log('  Added ' + year);
}

// === Veloster (2012-2021) ===
console.log('\n=== VELOSTER ===');
// FS (2012-2017)
for (let year = 2012; year <= 2017; year++) {
  if (addEntry(year, 'Veloster', ['Base', 'Turbo', 'Rally Edition'])) console.log('  Added ' + year);
}
// JS (2019-2021, skipped 2018)
for (let year = 2019; year <= 2021; year++) {
  if (addEntry(year, 'Veloster', ['2.0', '2.0 Premium', 'Turbo', 'Turbo R-Spec', 'N'])) console.log('  Added ' + year);
}

// === Accent (2006-2022) ===
console.log('\n=== ACCENT ===');
// MC (2006-2011)
for (let year = 2006; year <= 2011; year++) {
  if (addEntry(year, 'Accent', ['GLS', 'GS', 'SE'])) console.log('  Added ' + year);
}
// RB (2012-2017)
for (let year = 2012; year <= 2017; year++) {
  if (addEntry(year, 'Accent', ['GLS', 'GS', 'SE', 'Sport'])) console.log('  Added ' + year);
}
// HC (2018-2022)
for (let year = 2018; year <= 2022; year++) {
  if (addEntry(year, 'Accent', ['SE', 'SEL', 'Limited'])) console.log('  Added ' + year);
}

// === Genesis Coupe (2010-2016) ===
console.log('\n=== GENESIS COUPE ===');
for (let year = 2010; year <= 2016; year++) {
  if (addEntry(year, 'Genesis Coupe', ['2.0T', '2.0T Premium', '2.0T R-Spec', '3.8', '3.8 Grand Touring', '3.8 Ultimate', '3.8 R-Spec'])) console.log('  Added ' + year);
}

// === Ioniq 5 (2022-2025) ===
console.log('\n=== IONIQ 5 ===');
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Ioniq 5', ['SE Standard Range', 'SE Long Range', 'SEL', 'Limited', 'N'])) console.log('  Added ' + year);
}

// === Ioniq 6 (2023-2025) ===
console.log('\n=== IONIQ 6 ===');
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'Ioniq 6', ['SE Standard Range', 'SE Long Range', 'SEL', 'Limited'])) console.log('  Added ' + year);
}

// === Venue (2020-2025) ===
console.log('\n=== VENUE ===');
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'Venue', ['SE', 'SEL', 'Limited'])) console.log('  Added ' + year);
}

// === 2026 Model Year ===
console.log('\n=== 2026 MODEL YEAR ===');
const hyundai2026 = {
  'Sonata': ['SE', 'SEL', 'SEL Plus', 'Limited', 'N Line', 'Hybrid'],
  'Elantra': ['SE', 'SEL', 'Limited', 'N Line', 'N', 'Hybrid'],
  'Tucson': ['SE', 'SEL', 'N Line', 'XRT', 'Limited', 'Hybrid', 'PHEV'],
  'Santa Fe': ['SE', 'SEL', 'XRT', 'Limited', 'Calligraphy', 'Hybrid'],
  'Kona': ['SE', 'SEL', 'N Line', 'Limited', 'Electric'],
  'Palisade': ['SE', 'SEL', 'Limited', 'Calligraphy'],
  'Santa Cruz': ['SE', 'SEL', 'SEL Premium', 'Limited', 'Night'],
  'Ioniq 5': ['SE Standard Range', 'SE Long Range', 'SEL', 'Limited', 'N'],
  'Ioniq 6': ['SE Standard Range', 'SE Long Range', 'SEL', 'Limited'],
  'Venue': ['SE', 'SEL', 'Limited'],
};
Object.entries(hyundai2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) console.log('  Added 2026 Hyundai ' + model);
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].Hyundai) {
    const sorted = {};
    Object.keys(ymmt[year].Hyundai).sort().forEach(function(model) {
      sorted[model] = ymmt[year].Hyundai[model];
    });
    ymmt[year].Hyundai = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' Hyundai YMMT entries total');
