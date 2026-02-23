const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Kia) ymmt[yearStr].Kia = {};
  if (!ymmt[yearStr].Kia[model]) {
    ymmt[yearStr].Kia[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === Optima / K5 (2001-2025) ===
console.log('=== OPTIMA / K5 ===');
// 1st gen (2001-2005)
for (let year = 2001; year <= 2005; year++) {
  if (addEntry(year, 'Optima', ['LX', 'EX', 'SE'])) console.log('  Added ' + year);
}
// 2nd gen (2006-2010)
for (let year = 2006; year <= 2010; year++) {
  if (addEntry(year, 'Optima', ['LX', 'EX', 'SX'])) console.log('  Added ' + year);
}
// 3rd gen (2011-2015)
for (let year = 2011; year <= 2015; year++) {
  if (addEntry(year, 'Optima', ['LX', 'EX', 'SX', 'SXL', 'Hybrid'])) console.log('  Added ' + year);
}
// 4th gen (2016-2020)
for (let year = 2016; year <= 2020; year++) {
  if (addEntry(year, 'Optima', ['LX', 'S', 'EX', 'SX', 'Hybrid', 'PHEV'])) console.log('  Added ' + year);
}
// K5 (2021-2025)
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'K5', ['LX', 'LXS', 'GT-Line', 'EX', 'GT'])) console.log('  Added K5 ' + year);
}

// === Sorento (2003-2025) ===
console.log('\n=== SORENTO ===');
// 1st gen (2003-2009)
for (let year = 2003; year <= 2009; year++) {
  if (addEntry(year, 'Sorento', ['LX', 'EX'])) console.log('  Added ' + year);
}
// 2nd gen (2011-2015)
for (let year = 2011; year <= 2015; year++) {
  if (addEntry(year, 'Sorento', ['LX', 'EX', 'SX', 'SXL'])) console.log('  Added ' + year);
}
// 3rd gen (2016-2020)
for (let year = 2016; year <= 2020; year++) {
  if (addEntry(year, 'Sorento', ['L', 'LX', 'EX', 'SX', 'SXL'])) console.log('  Added ' + year);
}
// 4th gen (2021-2025)
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'Sorento', ['LX', 'S', 'EX', 'SX', 'SX Prestige', 'X-Line', 'Hybrid', 'PHEV'])) console.log('  Added ' + year);
}

// === Sportage (2005-2025) ===
console.log('\n=== SPORTAGE ===');
// 2nd gen (2005-2010)
for (let year = 2005; year <= 2010; year++) {
  if (addEntry(year, 'Sportage', ['LX', 'EX'])) console.log('  Added ' + year);
}
// 3rd gen (2011-2016)
for (let year = 2011; year <= 2016; year++) {
  if (addEntry(year, 'Sportage', ['Base', 'LX', 'EX', 'SX'])) console.log('  Added ' + year);
}
// 4th gen (2017-2022)
for (let year = 2017; year <= 2022; year++) {
  if (addEntry(year, 'Sportage', ['LX', 'EX', 'S', 'SX Turbo'])) console.log('  Added ' + year);
}
// 5th gen (2023-2025)
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'Sportage', ['LX', 'EX', 'X-Line', 'SX Prestige', 'X-Pro', 'Hybrid', 'PHEV'])) console.log('  Added ' + year);
}

// === Forte (2010-2025) ===
console.log('\n=== FORTE ===');
// 1st gen (2010-2013)
for (let year = 2010; year <= 2013; year++) {
  if (addEntry(year, 'Forte', ['LX', 'EX', 'SX', 'Koup'])) console.log('  Added ' + year);
}
// 2nd gen (2014-2018)
for (let year = 2014; year <= 2018; year++) {
  if (addEntry(year, 'Forte', ['LX', 'S', 'EX', 'SX', 'Koup'])) console.log('  Added ' + year);
}
// 3rd gen (2019-2025)
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, 'Forte', ['FE', 'LXS', 'GT-Line', 'GT'])) console.log('  Added ' + year);
}

// === Telluride (2020-2025) ===
console.log('\n=== TELLURIDE ===');
for (let year = 2020; year <= 2025; year++) {
  if (addEntry(year, 'Telluride', ['LX', 'S', 'EX', 'SX', 'SX Prestige', 'X-Line', 'X-Pro'])) console.log('  Added ' + year);
}

// === Soul (2010-2024) ===
console.log('\n=== SOUL ===');
// 1st gen (2010-2013)
for (let year = 2010; year <= 2013; year++) {
  if (addEntry(year, 'Soul', ['Base', 'Plus', 'Exclaim'])) console.log('  Added ' + year);
}
// 2nd gen (2014-2019)
for (let year = 2014; year <= 2019; year++) {
  if (addEntry(year, 'Soul', ['Base', 'Plus', 'Exclaim', 'EV'])) console.log('  Added ' + year);
}
// 3rd gen (2020-2024)
for (let year = 2020; year <= 2024; year++) {
  if (addEntry(year, 'Soul', ['LX', 'S', 'GT-Line', 'EX', 'Turbo', 'EV'])) console.log('  Added ' + year);
}

// === Carnival / Sedona (2002-2025) ===
console.log('\n=== SEDONA / CARNIVAL ===');
// Sedona 1st gen (2002-2005)
for (let year = 2002; year <= 2005; year++) {
  if (addEntry(year, 'Sedona', ['LX', 'EX'])) console.log('  Added Sedona ' + year);
}
// Sedona 2nd gen (2006-2014)
for (let year = 2006; year <= 2014; year++) {
  if (addEntry(year, 'Sedona', ['LX', 'EX', 'SXL'])) console.log('  Added Sedona ' + year);
}
// Sedona 3rd gen (2015-2021)
for (let year = 2015; year <= 2021; year++) {
  if (addEntry(year, 'Sedona', ['L', 'LX', 'EX', 'SX', 'SXL'])) console.log('  Added Sedona ' + year);
}
// Carnival (2022-2025)
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'Carnival', ['LX', 'EX', 'SX', 'SX Prestige'])) console.log('  Added Carnival ' + year);
}

// === Seltos (2021-2025) ===
console.log('\n=== SELTOS ===');
for (let year = 2021; year <= 2025; year++) {
  if (addEntry(year, 'Seltos', ['LX', 'S', 'EX', 'SX', 'X-Line', 'Nightfall'])) console.log('  Added ' + year);
}

// === Stinger (2018-2023) ===
console.log('\n=== STINGER ===');
for (let year = 2018; year <= 2023; year++) {
  if (addEntry(year, 'Stinger', ['GT-Line', 'GT', 'GT1', 'GT2', 'Scorpion'])) console.log('  Added ' + year);
}

// === Rio (2006-2023) ===
console.log('\n=== RIO ===');
// 2nd gen (2006-2011)
for (let year = 2006; year <= 2011; year++) {
  if (addEntry(year, 'Rio', ['LX', 'SX', 'EX'])) console.log('  Added ' + year);
}
// 3rd gen (2012-2017)
for (let year = 2012; year <= 2017; year++) {
  if (addEntry(year, 'Rio', ['LX', 'EX', 'SX'])) console.log('  Added ' + year);
}
// 4th gen (2018-2023)
for (let year = 2018; year <= 2023; year++) {
  if (addEntry(year, 'Rio', ['LX', 'S', 'EX'])) console.log('  Added ' + year);
}

// === EV6 (2022-2025) ===
console.log('\n=== EV6 ===');
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'EV6', ['Light', 'Wind', 'GT-Line', 'GT'])) console.log('  Added ' + year);
}

// === Niro (2017-2025) ===
console.log('\n=== NIRO ===');
// 1st gen (2017-2022)
for (let year = 2017; year <= 2022; year++) {
  if (addEntry(year, 'Niro', ['LX', 'EX', 'Touring', 'PHEV', 'EV'])) console.log('  Added ' + year);
}
// 2nd gen (2023-2025)
for (let year = 2023; year <= 2025; year++) {
  if (addEntry(year, 'Niro', ['Wind', 'Wave', 'PHEV', 'EV'])) console.log('  Added ' + year);
}

// === EV9 (2024-2025) ===
console.log('\n=== EV9 ===');
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'EV9', ['Light', 'Wind', 'GT-Line'])) console.log('  Added ' + year);
}

// === 2026 Model Year ===
console.log('\n=== 2026 MODEL YEAR ===');
const kia2026 = {
  'K5': ['LX', 'LXS', 'GT-Line', 'EX', 'GT'],
  'Sorento': ['LX', 'S', 'EX', 'SX', 'SX Prestige', 'X-Line', 'Hybrid', 'PHEV'],
  'Sportage': ['LX', 'EX', 'X-Line', 'SX Prestige', 'X-Pro', 'Hybrid', 'PHEV'],
  'Forte': ['FE', 'LXS', 'GT-Line', 'GT'],
  'Telluride': ['LX', 'S', 'EX', 'SX', 'SX Prestige', 'X-Line', 'X-Pro'],
  'Carnival': ['LX', 'EX', 'SX', 'SX Prestige'],
  'Seltos': ['LX', 'S', 'EX', 'SX', 'X-Line', 'Nightfall'],
  'EV6': ['Light', 'Wind', 'GT-Line', 'GT'],
  'Niro': ['Wind', 'Wave', 'PHEV', 'EV'],
  'EV9': ['Light', 'Wind', 'GT-Line'],
};
Object.entries(kia2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) console.log('  Added 2026 Kia ' + model);
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].Kia) {
    const sorted = {};
    Object.keys(ymmt[year].Kia).sort().forEach(function(model) {
      sorted[model] = ymmt[year].Kia[model];
    });
    ymmt[year].Kia = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' Kia YMMT entries total');
