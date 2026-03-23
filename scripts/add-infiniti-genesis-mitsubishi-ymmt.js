#!/usr/bin/env node
/**
 * Add Infiniti, Genesis, and Mitsubishi to ymmt.json
 */
const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const data = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

function addModel(make, model, startYear, endYear, trims) {
  for (let y = startYear; y <= endYear; y++) {
    const yr = String(y);
    if (!data[yr]) data[yr] = {};
    if (!data[yr][make]) data[yr][make] = {};
    data[yr][make][model] = trims;
  }
}

// ── Infiniti ──
addModel('Infiniti', 'G35', 2003, 2007, ['Base', 'Coupe', 'Sport']);
addModel('Infiniti', 'G37', 2008, 2013, ['Base', 'Journey', 'Sport', 'IPL']);
addModel('Infiniti', 'Q50', 2014, 2026, ['Pure', 'Luxe', 'Sport', 'Red Sport 400', 'Sensory']);
addModel('Infiniti', 'Q60', 2014, 2026, ['Pure', 'Luxe', 'Red Sport 400']);
addModel('Infiniti', 'Q70', 2015, 2019, ['Base', 'Luxe']);
addModel('Infiniti', 'M35', 2003, 2010, ['Base', 'Sport', 'Premium']);
addModel('Infiniti', 'M37', 2011, 2013, ['Base', 'Sport', 'Premium']);
addModel('Infiniti', 'M56', 2011, 2013, ['Base', 'Sport', 'Premium']);
addModel('Infiniti', 'FX35', 2003, 2012, ['Base', 'Sport', 'Premium']);
addModel('Infiniti', 'FX45', 2003, 2008, ['Base', 'Sport', 'Premium']);
addModel('Infiniti', 'FX50', 2009, 2013, ['Base', 'Sport', 'Premium']);
addModel('Infiniti', 'QX50', 2014, 2026, ['Pure', 'Luxe', 'Sensory', 'Autograph']);
addModel('Infiniti', 'QX55', 2022, 2026, ['Luxe', 'Essential', 'Sensory']);
addModel('Infiniti', 'QX60', 2013, 2026, ['Pure', 'Luxe', 'Sensory', 'Autograph']);
addModel('Infiniti', 'QX70', 2014, 2017, ['Base', 'Sport', 'Premium']);
addModel('Infiniti', 'QX80', 2011, 2026, ['Base', 'Luxe', 'Sensory', 'Autograph']);
addModel('Infiniti', 'EX35', 2008, 2012, ['Base', 'Journey']);
addModel('Infiniti', 'EX37', 2013, 2013, ['Base', 'Journey']);

// ── Genesis ──
addModel('Genesis', 'G70', 2019, 2026, ['Standard', 'Advanced', 'Sport', 'Prestige', 'Sport Advanced']);
addModel('Genesis', 'G80', 2017, 2026, ['Standard', 'Advanced', 'Sport', 'Prestige', 'Electrified']);
addModel('Genesis', 'G90', 2017, 2026, ['Standard', 'Premium', 'Ultimate']);
addModel('Genesis', 'GV70', 2022, 2026, ['Standard', 'Advanced', 'Sport Prestige', 'Electrified']);
addModel('Genesis', 'GV80', 2021, 2026, ['Standard', 'Advanced', 'Prestige', 'Calligraphy']);
addModel('Genesis', 'GV60', 2023, 2026, ['Standard', 'Advanced', 'Performance']);
addModel('Genesis', 'GV80 Coupe', 2025, 2026, ['Standard', 'Advanced']);

// ── Mitsubishi ──
addModel('Mitsubishi', 'Outlander', 2003, 2026, ['ES', 'SE', 'SEL', 'GT', 'PHEV']);
addModel('Mitsubishi', 'Eclipse Cross', 2018, 2026, ['ES', 'LE', 'SE', 'SEL', 'PHEV']);
addModel('Mitsubishi', 'Outlander Sport', 2011, 2026, ['ES', 'SE', 'LE', 'GT']);
addModel('Mitsubishi', 'Mirage', 2014, 2026, ['ES', 'LE', 'SE', 'GT']);
addModel('Mitsubishi', 'Lancer', 2002, 2017, ['ES', 'SE', 'GT', 'Ralliart', 'Evolution']);
addModel('Mitsubishi', 'Eclipse', 2000, 2012, ['GS', 'GT', 'Spyder']);
addModel('Mitsubishi', 'Galant', 2000, 2012, ['ES', 'DE', 'SE', 'GT', 'Ralliart']);
addModel('Mitsubishi', 'Endeavor', 2004, 2011, ['LS', 'SE', 'Limited']);
addModel('Mitsubishi', 'Montero Sport', 2000, 2004, ['ES', 'LS', 'XLS', 'Limited']);

// Sort years numerically, and within each year sort makes alphabetically
const sortedYears = Object.keys(data).sort((a, b) => Number(a) - Number(b));
const sorted = {};
for (const yr of sortedYears) {
  sorted[yr] = {};
  const makes = Object.keys(data[yr]).sort();
  for (const mk of makes) {
    sorted[yr][mk] = {};
    const models = Object.keys(data[yr][mk]).sort();
    for (const md of models) {
      sorted[yr][mk][md] = data[yr][mk][md];
    }
  }
}

fs.writeFileSync(ymmtPath, JSON.stringify(sorted, null, 2) + '\n');

// Count entries
let infiniti = 0, genesis = 0, mitsubishi = 0;
for (const yr of Object.keys(sorted)) {
  if (sorted[yr]['Infiniti']) infiniti += Object.keys(sorted[yr]['Infiniti']).length;
  if (sorted[yr]['Genesis']) genesis += Object.keys(sorted[yr]['Genesis']).length;
  if (sorted[yr]['Mitsubishi']) mitsubishi += Object.keys(sorted[yr]['Mitsubishi']).length;
}
console.log(`YMMT entries added:`);
console.log(`  Infiniti: ${infiniti} year-model entries`);
console.log(`  Genesis: ${genesis} year-model entries`);
console.log(`  Mitsubishi: ${mitsubishi} year-model entries`);
console.log(`  Total: ${infiniti + genesis + mitsubishi}`);
