#!/usr/bin/env node
/**
 * Quick verification that procedure hints load correctly for test vehicles.
 */
const d = require('../src/data/vehicle-specs.json');

function simulateGetVehicleSpecs(year, make, model, trim) {
  const makeData = d[make];
  if (!makeData) return null;

  let modelData = makeData[model];
  if (!modelData) {
    const modelKey = Object.keys(makeData).find(k =>
      model.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(model.toLowerCase())
    );
    if (modelKey) modelData = makeData[modelKey];
  }
  if (!modelData) return null;

  let rawSpecs = null;
  const trimLower = (trim || '').toLowerCase();

  for (const [genKey, genData] of Object.entries(modelData)) {
    if (!genData.years || !genData.years.includes(year)) continue;
    const genKeyLower = genKey.toLowerCase();
    const hasTrimMatch =
      (trimLower && genKeyLower.split(/[\/,]/).some(p => trimLower.includes(p.trim()))) ||
      (trimLower && trimLower.split(/[\s,]/).some(p => p.length > 1 && genKeyLower.includes(p)));
    if (hasTrimMatch) { rawSpecs = genData; break; }
    if (!rawSpecs) rawSpecs = genData;
  }

  return rawSpecs;
}

const testCases = [
  { year: 2019, make: 'Chevrolet', model: 'Camaro', trim: 'ZL1', expectedEngine: 'LT4' },
  { year: 2019, make: 'Chevrolet', model: 'Camaro', trim: 'SS', expectedEngine: 'LT1' },
  { year: 2020, make: 'Ford', model: 'Mustang', trim: 'GT', expectedEngine: 'Coyote' },
  { year: 2019, make: 'Ford', model: 'Mustang', trim: 'EcoBoost', expectedEngine: 'EcoBoost' },
  { year: 2018, make: 'Ford', model: 'Mustang', trim: 'GT350', expectedEngine: 'Voodoo' },
  { year: 2020, make: 'Ford', model: 'F-150', trim: 'XLT', expectedEngine: '2.7L' },
  { year: 2019, make: 'Toyota', model: '86', trim: '', expectedEngine: 'Boxer' },
  { year: 2020, make: 'BMW', model: '3 Series', trim: '330i', expectedEngine: 'B48' },
  { year: 2021, make: 'Chevrolet', model: 'Corvette', trim: 'Stingray', expectedEngine: 'LT2' },
  { year: 2020, make: 'Toyota', model: 'Camry', trim: 'LE', expectedEngine: 'A25A' },
  { year: 2022, make: 'Honda', model: 'Civic', trim: 'Sport', expectedEngine: 'L15B' },
  { year: 2023, make: 'Subaru', model: 'WRX', trim: 'Premium', expectedEngine: 'FA24' },
  { year: 2021, make: 'RAM', model: '1500', trim: 'Laramie', expectedEngine: 'Hemi' },
  { year: 2021, make: 'RAM', model: '2500', trim: 'Cummins', expectedEngine: 'Cummins' },
  { year: 2020, make: 'Dodge', model: 'Challenger', trim: 'R/T', expectedEngine: 'Hemi' },
  { year: 2022, make: 'Jeep', model: 'Wrangler', trim: 'Sport', expectedEngine: 'Pentastar' },
];

let passed = 0;
let failed = 0;

console.log('\n' + '='.repeat(70));
console.log('Procedure Hints Verification');
console.log('='.repeat(70) + '\n');

for (const tc of testCases) {
  const specs = simulateGetVehicleSpecs(tc.year, tc.make, tc.model, tc.trim);
  const hasProcedures = specs && specs.procedures && specs.procedures.oil_change;
  const isVerified = hasProcedures && specs.procedures.oil_change.verified;
  const hintCount = hasProcedures ? specs.procedures.oil_change.stepHints.length : 0;
  const engineMatch = specs && specs.engine.toLowerCase().includes(tc.expectedEngine.toLowerCase());

  const status = hasProcedures && isVerified && engineMatch ? 'PASS' : 'FAIL';
  if (status === 'PASS') passed++;
  else failed++;

  console.log(`  [${status}] ${tc.year} ${tc.make} ${tc.model} ${tc.trim}`);
  if (specs) {
    console.log(`        Engine: ${specs.engine.substring(0, 50)}`);
    console.log(`        Procedures: ${hasProcedures ? `yes (${hintCount} hints, verified=${isVerified})` : 'MISSING'}`);
  } else {
    console.log(`        Specs: NOT FOUND`);
  }
  if (!engineMatch && specs) {
    console.log(`        Expected engine containing "${tc.expectedEngine}" but got "${specs.engine}"`);
  }
  console.log('');
}

console.log('-'.repeat(70));
console.log(`Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
console.log('-'.repeat(70));

process.exit(failed > 0 ? 1 : 0);
