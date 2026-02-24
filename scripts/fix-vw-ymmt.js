const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Volkswagen) ymmt[yearStr].Volkswagen = {};
  if (!ymmt[yearStr].Volkswagen[model]) {
    ymmt[yearStr].Volkswagen[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === Golf / GTI (1999-2025) ===
console.log('=== GOLF / GTI ===');
// Mk4 (1999-2006)
for (let year = 1999; year <= 2006; year++) {
  if (addEntry(year, 'Golf', ['GL', 'GLS', 'GTI', 'R32'])) console.log('  Added ' + year);
}
// Mk5 (2006-2009) - may overlap
for (let year = 2006; year <= 2009; year++) {
  if (addEntry(year, 'Golf', ['2.5', 'GTI', 'R32'])) console.log('  Added ' + year);
}
// Mk6 (2010-2014)
for (let year = 2010; year <= 2014; year++) {
  if (addEntry(year, 'Golf', ['2.5L', 'TDI', 'GTI', 'R'])) console.log('  Added ' + year);
}
// Mk7/7.5 (2015-2021)
for (let year = 2015; year <= 2021; year++) {
  if (addEntry(year, 'Golf', ['S', 'SE', 'TSI', 'GTI S', 'GTI SE', 'GTI Autobahn', 'R', 'Alltrack', 'SportWagen'])) console.log('  Added ' + year);
}
// Mk8 GTI/R only in US (2022-2025)
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Golf', ['GTI S', 'GTI SE', 'GTI Autobahn', 'R'])) console.log('  Added ' + year);
}

// === Jetta (2000-2025) ===
console.log('\n=== JETTA ===');
// Mk4 (2000-2005)
for (let year = 2000; year <= 2005; year++) {
  if (addEntry(year, 'Jetta', ['GL', 'GLS', 'GLI', 'TDI', 'Wolfsburg'])) console.log('  Added ' + year);
}
// Mk5 (2006-2010)
for (let year = 2006; year <= 2010; year++) {
  if (addEntry(year, 'Jetta', ['2.5 S', '2.5 SE', 'SEL', 'TDI', 'GLI', 'Wolfsburg'])) console.log('  Added ' + year);
}
// Mk6 (2011-2018)
for (let year = 2011; year <= 2018; year++) {
  if (addEntry(year, 'Jetta', ['S', 'SE', 'SEL', 'SEL Premium', 'TDI', 'GLI', 'Sport'])) console.log('  Added ' + year);
}
// Mk7 (2019-2025)
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, 'Jetta', ['S', 'SE', 'SEL', 'SEL Premium', 'GLI S', 'GLI Autobahn'])) console.log('  Added ' + year);
}

// === Passat (2006-2022) ===
console.log('\n=== PASSAT ===');
// B6 (2006-2010)
for (let year = 2006; year <= 2010; year++) {
  if (addEntry(year, 'Passat', ['2.0T', '3.6L', 'Komfort', 'Lux', 'VR6'])) console.log('  Added ' + year);
}
// NMS (2012-2022)
for (let year = 2012; year <= 2022; year++) {
  if (addEntry(year, 'Passat', ['S', 'SE', 'SEL', 'SEL Premium', 'R-Line', 'Limited Edition'])) console.log('  Added ' + year);
}

// === Tiguan (2009-2025) ===
console.log('\n=== TIGUAN ===');
// 1st gen (2009-2017)
for (let year = 2009; year <= 2017; year++) {
  if (addEntry(year, 'Tiguan', ['S', 'SE', 'SEL', 'R-Line'])) console.log('  Added ' + year);
}
// 2nd gen (2018-2025)
for (let year = 2018; year <= 2025; year++) {
  if (addEntry(year, 'Tiguan', ['S', 'SE', 'SE R-Line', 'SEL', 'SEL R-Line'])) console.log('  Added ' + year);
}

// === Atlas (2018-2025) ===
console.log('\n=== ATLAS ===');
for (let year = 2018; year <= 2025; year++) {
  if (addEntry(year, 'Atlas', ['S', 'SE', 'SE w/ Technology', 'SEL', 'SEL R-Line', 'SEL Premium R-Line'])) console.log('  Added ' + year);
}

// === Atlas Cross Sport (2020-2025) ===
console.log('\n=== ATLAS CROSS SPORT ===');
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'Atlas Cross Sport', ['S', 'SE', 'SE w/ Technology', 'SEL', 'SEL R-Line', 'SEL Premium R-Line'])) console.log('  Added ' + year);
}

// === Taos (2022-2025) ===
console.log('\n=== TAOS ===');
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Taos', ['S', 'SE', 'SEL'])) console.log('  Added ' + year);
}

// === ID.4 (2021-2025) ===
console.log('\n=== ID.4 ===');
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'ID.4', ['Standard', 'Pro', 'Pro S', 'Pro S Plus', 'AWD Pro', 'AWD Pro S', 'AWD Pro S Plus'])) console.log('  Added ' + year);
}

// === Touareg (2004-2017) ===
console.log('\n=== TOUAREG ===');
// 1st gen (2004-2010)
for (let year = 2004; year <= 2010; year++) {
  if (addEntry(year, 'Touareg', ['V6', 'V8', 'V10 TDI', 'R50'])) console.log('  Added ' + year);
}
// 2nd gen (2011-2017)
for (let year = 2011; year <= 2017; year++) {
  if (addEntry(year, 'Touareg', ['Sport', 'Lux', 'Executive', 'TDI Sport', 'TDI Lux', 'TDI Executive'])) console.log('  Added ' + year);
}

// === CC (2009-2017) ===
console.log('\n=== CC ===');
for (let year = 2009; year <= 2017; year++) {
  if (addEntry(year, 'CC', ['Sport', 'Luxury', 'Executive', 'R-Line', 'V6 Executive', 'V6 Lux'])) console.log('  Added ' + year);
}

// === Beetle (2012-2019) ===
console.log('\n=== BEETLE ===');
for (let year = 2012; year <= 2019; year++) {
  if (addEntry(year, 'Beetle', ['2.5L', 'S', 'SE', 'SEL', 'Turbo', 'Dune', 'Final Edition'])) console.log('  Added ' + year);
}

// === Eos (2007-2016) ===
console.log('\n=== EOS ===');
for (let year = 2007; year <= 2016; year++) {
  if (addEntry(year, 'Eos', ['2.0T', 'Komfort', 'Lux', 'Sport', 'Executive', 'Final Edition'])) console.log('  Added ' + year);
}

// === Rabbit (2006-2009) ===
console.log('\n=== RABBIT ===');
for (let year = 2006; year <= 2009; year++) {
  if (addEntry(year, 'Rabbit', ['2.5 S', '2.5 SE'])) console.log('  Added ' + year);
}

// === Arteon (2019-2023) ===
console.log('\n=== ARTEON ===');
for (let year = 2019; year <= 2023; year++) {
  if (addEntry(year, 'Arteon', ['SE', 'SEL R-Line', 'SEL Premium R-Line'])) console.log('  Added ' + year);
}

// === ID. Buzz (2025) ===
console.log('\n=== ID. BUZZ ===');
if (addEntry(2025, 'ID. Buzz', ['Pro S', 'Pro S Plus', '1st Edition'])) console.log('  Added 2025');

// === 2026 Model Year ===
console.log('\n=== 2026 MODEL YEAR ===');
const vw2026 = {
  'Golf': ['GTI S', 'GTI SE', 'GTI Autobahn', 'R'],
  'Jetta': ['S', 'SE', 'SEL', 'SEL Premium', 'GLI S', 'GLI Autobahn'],
  'Tiguan': ['S', 'SE', 'SE R-Line', 'SEL', 'SEL R-Line'],
  'Atlas': ['S', 'SE', 'SE w/ Technology', 'SEL', 'SEL R-Line', 'SEL Premium R-Line'],
  'Atlas Cross Sport': ['S', 'SE', 'SE w/ Technology', 'SEL', 'SEL R-Line', 'SEL Premium R-Line'],
  'Taos': ['S', 'SE', 'SEL'],
  'ID.4': ['Standard', 'Pro', 'Pro S', 'Pro S Plus', 'AWD Pro', 'AWD Pro S'],
  'ID. Buzz': ['Pro S', 'Pro S Plus', '1st Edition'],
};
Object.entries(vw2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) console.log('  Added 2026 VW ' + model);
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].Volkswagen) {
    const sorted = {};
    Object.keys(ymmt[year].Volkswagen).sort().forEach(function(model) {
      sorted[model] = ymmt[year].Volkswagen[model];
    });
    ymmt[year].Volkswagen = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' VW YMMT entries total');
