const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr].Volvo) ymmt[yearStr].Volvo = {};
  if (!ymmt[yearStr].Volvo[model]) {
    ymmt[yearStr].Volvo[model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// === XC90 (2003-2025) ===
console.log('=== XC90 ===');
// 1st gen (2003-2014)
for (let year = 2003; year <= 2014; year++) {
  if (addEntry(year, 'XC90', ['2.5T', '3.2', 'T6', 'V8'])) console.log('  Added ' + year);
}
// 2nd gen (2016-2025)
for (let year = 2016; year <= 2025; year++) {
  if (addEntry(year, 'XC90', ['T5 Momentum', 'T5 R-Design', 'T6 Momentum', 'T6 Inscription', 'T6 R-Design', 'T8 Recharge', 'Ultimate'])) console.log('  Added ' + year);
}

// === XC60 (2010-2025) ===
console.log('\n=== XC60 ===');
// 1st gen (2010-2017)
for (let year = 2010; year <= 2017; year++) {
  if (addEntry(year, 'XC60', ['3.2', 'T5', 'T6', 'T6 R-Design'])) console.log('  Added ' + year);
}
// 2nd gen (2018-2025)
for (let year = 2018; year <= 2025; year++) {
  if (addEntry(year, 'XC60', ['T5 Momentum', 'T5 R-Design', 'T6 Momentum', 'T6 Inscription', 'T6 R-Design', 'T8 Recharge', 'Ultimate'])) console.log('  Added ' + year);
}

// === XC40 (2019-2025) ===
console.log('\n=== XC40 ===');
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, 'XC40', ['T4 Momentum', 'T5 Momentum', 'T5 R-Design', 'T5 Inscription', 'Recharge Pure Electric'])) console.log('  Added ' + year);
}

// === S60 (2001-2025) ===
console.log('\n=== S60 ===');
// 1st gen (2001-2009)
for (let year = 2001; year <= 2009; year++) {
  if (addEntry(year, 'S60', ['2.4', '2.5T', 'T5', 'R'])) console.log('  Added ' + year);
}
// 2nd gen (2011-2018)
for (let year = 2011; year <= 2018; year++) {
  if (addEntry(year, 'S60', ['T5', 'T5 Drive-E', 'T6', 'T6 R-Design', 'T6 Polestar', 'Cross Country'])) console.log('  Added ' + year);
}
// 3rd gen (2019-2025)
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, 'S60', ['T5 Momentum', 'T5 R-Design', 'T6 Momentum', 'T6 Inscription', 'T6 R-Design', 'T8 Recharge', 'Polestar Engineered'])) console.log('  Added ' + year);
}

// === S90 (2017-2025) ===
console.log('\n=== S90 ===');
for (let year = 2017; year <= 2025; year++) {
  if (addEntry(year, 'S90', ['T5 Momentum', 'T6 Momentum', 'T6 Inscription', 'T6 R-Design', 'T8 Recharge'])) console.log('  Added ' + year);
}

// === V60 (2015-2025) ===
console.log('\n=== V60 ===');
// 1st gen (2015-2018)
for (let year = 2015; year <= 2018; year++) {
  if (addEntry(year, 'V60', ['T5', 'T5 Drive-E', 'T6', 'T6 R-Design', 'Cross Country'])) console.log('  Added ' + year);
}
// 2nd gen (2019-2025)
for (let year = 2019; year <= 2025; year++) {
  if (addEntry(year, 'V60', ['T5 Momentum', 'T5 R-Design', 'T6 Inscription', 'T8 Recharge', 'Cross Country'])) console.log('  Added ' + year);
}

// === V90 (2017-2025) ===
console.log('\n=== V90 ===');
for (let year = 2017; year <= 2025; year++) {
  if (addEntry(year, 'V90', ['T6 Inscription', 'T6 R-Design', 'Cross Country T6'])) console.log('  Added ' + year);
}

// === C40 Recharge (2022-2025) ===
console.log('\n=== C40 RECHARGE ===');
for (let year = 2022; year <= 2025; year++) {
  if (addEntry(year, 'C40 Recharge', ['Core', 'Plus', 'Ultimate'])) console.log('  Added ' + year);
}

// === EX30 (2024-2025) ===
console.log('\n=== EX30 ===');
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'EX30', ['Core', 'Plus', 'Ultra', 'Cross Country'])) console.log('  Added ' + year);
}

// === EX90 (2024-2025) ===
console.log('\n=== EX90 ===');
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'EX90', ['Plus', 'Ultra'])) console.log('  Added ' + year);
}

// === S40 (2004-2011) ===
console.log('\n=== S40 ===');
for (let year = 2004; year <= 2011; year++) {
  if (addEntry(year, 'S40', ['2.4i', 'T5', 'T5 R-Design'])) console.log('  Added ' + year);
}

// === V50 (2005-2011) ===
console.log('\n=== V50 ===');
for (let year = 2005; year <= 2011; year++) {
  if (addEntry(year, 'V50', ['2.4i', 'T5', 'T5 R-Design'])) console.log('  Added ' + year);
}

// === XC70 (2001-2016) ===
console.log('\n=== XC70 ===');
for (let year = 2001; year <= 2007; year++) {
  if (addEntry(year, 'XC70', ['2.5T', 'Cross Country'])) console.log('  Added ' + year);
}
for (let year = 2008; year <= 2016; year++) {
  if (addEntry(year, 'XC70', ['3.2', 'T5', 'T6'])) console.log('  Added ' + year);
}

// === S80 (2007-2016) ===
console.log('\n=== S80 ===');
for (let year = 2007; year <= 2016; year++) {
  if (addEntry(year, 'S80', ['3.2', 'T6', 'T6 R-Design'])) console.log('  Added ' + year);
}

// === 2026 Model Year ===
console.log('\n=== 2026 MODEL YEAR ===');
const volvo2026 = {
  'XC90': ['T5 Momentum', 'T6 Momentum', 'T6 Inscription', 'T6 R-Design', 'T8 Recharge', 'Ultimate'],
  'XC60': ['T5 Momentum', 'T6 Momentum', 'T6 Inscription', 'T6 R-Design', 'T8 Recharge', 'Ultimate'],
  'XC40': ['T4 Momentum', 'T5 Momentum', 'T5 R-Design', 'Recharge Pure Electric'],
  'S60': ['T5 Momentum', 'T6 Inscription', 'T8 Recharge'],
  'V60': ['T5 Momentum', 'T8 Recharge', 'Cross Country'],
  'C40 Recharge': ['Core', 'Plus', 'Ultimate'],
  'EX30': ['Core', 'Plus', 'Ultra', 'Cross Country'],
  'EX90': ['Plus', 'Ultra'],
};
Object.entries(volvo2026).forEach(function([model, trims]) {
  if (addEntry(2026, model, trims)) console.log('  Added 2026 Volvo ' + model);
});

// Sort models alphabetically within each year
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].Volvo) {
    const sorted = {};
    Object.keys(ymmt[year].Volvo).sort().forEach(function(model) {
      sorted[model] = ymmt[year].Volvo[model];
    });
    ymmt[year].Volvo = sorted;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' Volvo YMMT entries total');
