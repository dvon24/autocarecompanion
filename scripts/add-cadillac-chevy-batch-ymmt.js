const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const data = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Helper to add a model to a year/make, maintaining alphabetical sort
function addModel(year, make, model, trims) {
  const y = String(year);
  if (!data[y]) data[y] = {};
  if (!data[y][make]) data[y][make] = {};
  if (!data[y][make][model]) {
    data[y][make][model] = trims;
    // Sort models alphabetically within the make
    const sorted = {};
    Object.keys(data[y][make]).sort().forEach(k => { sorted[k] = data[y][make][k]; });
    data[y][make] = sorted;
    return true;
  }
  return false; // already exists
}

let added = 0;

// ============================================================
// 1. Cadillac CT5-V — already exists as trims on CT5 (V, V Blackwing)
// Just verify the trims are there (they are: V, V Blackwing on 2020+)
// No separate YMMT model needed
// ============================================================
console.log('CT5-V: Already exists as trims on Cadillac CT5 (V, V Blackwing)');

// ============================================================
// 2. Cadillac Celestiq (2024+) — Hand-built EV
// ============================================================
const celestiqTrims = ['Base'];
for (let y = 2024; y <= 2026; y++) {
  if (addModel(y, 'Cadillac', 'Celestiq', celestiqTrims)) {
    added++;
    console.log(`ADDED: ${y} Cadillac Celestiq`);
  }
}

// ============================================================
// 3. Cadillac V-Series Blackwing — already exists as trims on CT4/CT5
// CT4 has: V Blackwing (2022+), V-Series Blackwing (2026+)
// CT5 has: V Blackwing (2022+), V-Series Blackwing (2026+)
// No separate model needed
// ============================================================
console.log('V-Series Blackwing: Already exists as trims on CT4 and CT5');

// ============================================================
// 4. Chevrolet Sonic (2012-2020)
// ============================================================
const sonicTrims2012_2016 = ['LS', 'LT', 'LTZ', 'RS'];
const sonicTrims2017_2020 = ['LS', 'LT', 'LTZ', 'Premier'];
for (let y = 2012; y <= 2016; y++) {
  if (addModel(y, 'Chevrolet', 'Sonic', sonicTrims2012_2016)) {
    added++;
    console.log(`ADDED: ${y} Chevrolet Sonic`);
  }
}
for (let y = 2017; y <= 2020; y++) {
  if (addModel(y, 'Chevrolet', 'Sonic', sonicTrims2017_2020)) {
    added++;
    console.log(`ADDED: ${y} Chevrolet Sonic`);
  }
}

// ============================================================
// 5. Chevrolet SS (2014-2017)
// ============================================================
const ssTrims = ['Base'];
for (let y = 2014; y <= 2017; y++) {
  if (addModel(y, 'Chevrolet', 'SS', ssTrims)) {
    added++;
    console.log(`ADDED: ${y} Chevrolet SS`);
  }
}

// ============================================================
// 6. Chevrolet Volt (2011-2019)
// Gen 1: 2011-2015
// Gen 2: 2016-2019
// ============================================================
const voltTrimsGen1 = ['Base', 'Premium'];
const voltTrimsGen2 = ['LT', 'Premier'];
for (let y = 2011; y <= 2015; y++) {
  if (addModel(y, 'Chevrolet', 'Volt', voltTrimsGen1)) {
    added++;
    console.log(`ADDED: ${y} Chevrolet Volt`);
  }
}
for (let y = 2016; y <= 2019; y++) {
  if (addModel(y, 'Chevrolet', 'Volt', voltTrimsGen2)) {
    added++;
    console.log(`ADDED: ${y} Chevrolet Volt`);
  }
}

// ============================================================
// 7. Chevrolet Blazer EV (2024+)
// ============================================================
const blazerEvTrims2024 = ['1LT', '2LT', 'RS', 'SS'];
const blazerEvTrims2025 = ['1LT', '2LT', 'RS', 'SS'];
if (addModel(2024, 'Chevrolet', 'Blazer EV', blazerEvTrims2024)) {
  added++;
  console.log('ADDED: 2024 Chevrolet Blazer EV');
}
if (addModel(2025, 'Chevrolet', 'Blazer EV', blazerEvTrims2025)) {
  added++;
  console.log('ADDED: 2025 Chevrolet Blazer EV');
}

// ============================================================
// 8. Chevrolet Equinox EV (2024+)
// ============================================================
const equinoxEvTrims2024 = ['1LT', '2LT', '2RS', '3RS'];
const equinoxEvTrims2025 = ['1LT', '2LT', '2RS', '3RS'];
if (addModel(2024, 'Chevrolet', 'Equinox EV', equinoxEvTrims2024)) {
  added++;
  console.log('ADDED: 2024 Chevrolet Equinox EV');
}
if (addModel(2025, 'Chevrolet', 'Equinox EV', equinoxEvTrims2025)) {
  added++;
  console.log('ADDED: 2025 Chevrolet Equinox EV');
}

// ============================================================
// 9. Chevrolet Cobalt (2005-2010)
// ============================================================
const cobaltTrims2005_2007 = ['Base', 'LS', 'LT', 'SS'];
const cobaltTrims2008_2010 = ['LS', 'LT', 'SS', 'Sport'];
for (let y = 2005; y <= 2007; y++) {
  if (addModel(y, 'Chevrolet', 'Cobalt', cobaltTrims2005_2007)) {
    added++;
    console.log(`ADDED: ${y} Chevrolet Cobalt`);
  }
}
for (let y = 2008; y <= 2010; y++) {
  if (addModel(y, 'Chevrolet', 'Cobalt', cobaltTrims2008_2010)) {
    added++;
    console.log(`ADDED: ${y} Chevrolet Cobalt`);
  }
}

// ============================================================
// 10. Chevrolet HHR (2006-2011)
// ============================================================
const hhrTrims2006_2008 = ['LS', 'LT', 'SS'];
const hhrTrims2009_2011 = ['LS', 'LT', 'SS Panel'];
for (let y = 2006; y <= 2008; y++) {
  if (addModel(y, 'Chevrolet', 'HHR', hhrTrims2006_2008)) {
    added++;
    console.log(`ADDED: ${y} Chevrolet HHR`);
  }
}
for (let y = 2009; y <= 2011; y++) {
  if (addModel(y, 'Chevrolet', 'HHR', hhrTrims2009_2011)) {
    added++;
    console.log(`ADDED: ${y} Chevrolet HHR`);
  }
}

// ============================================================
// 11. Chevrolet Avalanche (2002-2013)
// Gen 1: 2002-2006
// Gen 2: 2007-2013
// ============================================================
const avalancheTrimsGen1 = ['1500', '2500', 'LS', 'LT', 'Z71'];
const avalancheTrimsGen2 = ['LS', 'LT', 'LTZ', 'Black Diamond'];
for (let y = 2002; y <= 2006; y++) {
  if (addModel(y, 'Chevrolet', 'Avalanche', avalancheTrimsGen1)) {
    added++;
    console.log(`ADDED: ${y} Chevrolet Avalanche`);
  }
}
for (let y = 2007; y <= 2013; y++) {
  if (addModel(y, 'Chevrolet', 'Avalanche', avalancheTrimsGen2)) {
    added++;
    console.log(`ADDED: ${y} Chevrolet Avalanche`);
  }
}

console.log(`\nTotal YMMT entries added: ${added}`);

// Write back
fs.writeFileSync(ymmtPath, JSON.stringify(data, null, 2) + '\n');
console.log('Written to ymmt.json');
