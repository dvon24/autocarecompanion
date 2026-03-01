#!/usr/bin/env node
/**
 * Verification that procedure hints load correctly for test vehicles
 * across multiple maintenance types.
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

// ─── Part 1: Oil Change (verified=true) ────────────────────────────────

const oilTestCases = [
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
console.log('Part 1: Oil Change Procedures (verified=true)');
console.log('='.repeat(70) + '\n');

for (const tc of oilTestCases) {
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
  if (specs && !engineMatch) {
    console.log(`        Expected engine containing "${tc.expectedEngine}" but got "${specs.engine}"`);
  }
  console.log('');
}

// ─── Part 2: Multi-type coverage ───────────────────────────────────────

const multiTypeTests = [
  // Vehicle with all 9 types (truck with 4WD)
  { year: 2022, make: 'Jeep', model: 'Wrangler', trim: 'Sport',
    expectedTypes: ['oil_change', 'spark_plugs', 'coolant_flush', 'transmission_fluid',
                    'differential_fluid', 'transfer_case_fluid', 'brake_fluid', 'brake_inspection', 'tire_rotation'],
    unexpectedTypes: [] },
  // Sedan - no differential/transfer case
  { year: 2020, make: 'Toyota', model: 'Camry', trim: 'LE',
    expectedTypes: ['oil_change', 'spark_plugs', 'coolant_flush', 'transmission_fluid',
                    'brake_fluid', 'brake_inspection', 'tire_rotation'],
    unexpectedTypes: ['differential_fluid', 'transfer_case_fluid'] },
  // Diesel - no spark plugs
  { year: 2021, make: 'RAM', model: '2500', trim: 'Cummins',
    expectedTypes: ['oil_change', 'coolant_flush', 'transmission_fluid',
                    'differential_fluid', 'transfer_case_fluid', 'brake_fluid', 'brake_inspection', 'tire_rotation'],
    unexpectedTypes: ['spark_plugs'] },
  // BMW - should have lug BOLTS in brake_inspection
  { year: 2020, make: 'BMW', model: '3 Series', trim: '330i',
    expectedTypes: ['oil_change', 'spark_plugs', 'coolant_flush', 'transmission_fluid',
                    'brake_fluid', 'brake_inspection', 'tire_rotation'],
    unexpectedTypes: ['differential_fluid', 'transfer_case_fluid'] },
  // Sports car with differential
  { year: 2021, make: 'Chevrolet', model: 'Corvette', trim: 'Stingray',
    expectedTypes: ['oil_change', 'spark_plugs', 'coolant_flush', 'transmission_fluid',
                    'differential_fluid', 'brake_fluid', 'brake_inspection', 'tire_rotation'],
    unexpectedTypes: ['transfer_case_fluid'] },
];

console.log('='.repeat(70));
console.log('Part 2: Multi-Type Coverage');
console.log('='.repeat(70) + '\n');

for (const tc of multiTypeTests) {
  const specs = simulateGetVehicleSpecs(tc.year, tc.make, tc.model, tc.trim);
  if (!specs || !specs.procedures) {
    console.log(`  [FAIL] ${tc.year} ${tc.make} ${tc.model} ${tc.trim} - NO SPECS/PROCEDURES`);
    failed++;
    continue;
  }

  let allGood = true;
  const presentTypes = Object.keys(specs.procedures);

  for (const expectedType of tc.expectedTypes) {
    if (!specs.procedures[expectedType]) {
      console.log(`  [FAIL] ${tc.year} ${tc.make} ${tc.model} ${tc.trim} - MISSING: ${expectedType}`);
      allGood = false;
      failed++;
    }
  }
  for (const unexpectedType of tc.unexpectedTypes) {
    if (specs.procedures[unexpectedType]) {
      console.log(`  [FAIL] ${tc.year} ${tc.make} ${tc.model} ${tc.trim} - SHOULD NOT HAVE: ${unexpectedType}`);
      allGood = false;
      failed++;
    }
  }

  if (allGood) {
    console.log(`  [PASS] ${tc.year} ${tc.make} ${tc.model} ${tc.trim} - ${presentTypes.length} types: ${presentTypes.join(', ')}`);
    passed++;
  }
  console.log('');
}

// ─── Part 3: Content quality spot checks ───────────────────────────────

console.log('='.repeat(70));
console.log('Part 3: Content Quality Spot Checks');
console.log('='.repeat(70) + '\n');

const qualityChecks = [
  // BMW should mention lug BOLTS not nuts in brake_inspection
  { year: 2020, make: 'BMW', model: '3 Series', trim: '330i',
    type: 'brake_inspection', mustContain: 'lug BOLTS', label: 'BMW lug bolts' },
  // WRX spark_plugs should mention boxer/horizontal
  { year: 2023, make: 'Subaru', model: 'WRX', trim: 'Premium',
    type: 'spark_plugs', mustContain: 'horizontally', label: 'WRX boxer plug access' },
  // F-150 spark_plugs should say V6, not V8
  { year: 2020, make: 'Ford', model: 'F-150', trim: 'XLT',
    type: 'spark_plugs', mustContain: 'V6', label: 'F-150 V6 plug layout' },
  // Camry spark_plugs should mention no anti-seize
  { year: 2020, make: 'Toyota', model: 'Camry', trim: 'LE',
    type: 'spark_plugs', mustContain: 'Do NOT apply anti-seize', label: 'Camry no anti-seize' },
  // Wrangler transfer case should mention Mopar
  { year: 2022, make: 'Jeep', model: 'Wrangler', trim: 'Sport',
    type: 'transfer_case_fluid', mustContain: 'Mopar', label: 'Wrangler Mopar TC fluid' },
  // Civic coolant should mention Honda
  { year: 2022, make: 'Honda', model: 'Civic', trim: 'Sport',
    type: 'coolant_flush', mustContain: 'Honda', label: 'Civic Honda coolant' },
  // Corvette tire rotation should mention staggered
  { year: 2021, make: 'Chevrolet', model: 'Corvette', trim: 'Stingray',
    type: 'tire_rotation', mustContain: 'staggered', label: 'Corvette staggered tires' },
  // RAM 2500 Cummins should NOT have spark_plugs
  { year: 2021, make: 'RAM', model: '2500', trim: 'Cummins',
    type: 'spark_plugs', mustContain: null, label: 'RAM diesel no spark plugs' },
];

for (const qc of qualityChecks) {
  const specs = simulateGetVehicleSpecs(qc.year, qc.make, qc.model, qc.trim);
  const proc = specs && specs.procedures && specs.procedures[qc.type];

  if (qc.mustContain === null) {
    // Should NOT exist
    if (!proc) {
      console.log(`  [PASS] ${qc.label} - correctly absent`);
      passed++;
    } else {
      console.log(`  [FAIL] ${qc.label} - should not exist but does`);
      failed++;
    }
  } else {
    // Should exist and contain string
    if (!proc) {
      console.log(`  [FAIL] ${qc.label} - procedure not found`);
      failed++;
    } else {
      const allText = JSON.stringify(proc);
      if (allText.includes(qc.mustContain)) {
        console.log(`  [PASS] ${qc.label} - contains "${qc.mustContain}"`);
        passed++;
      } else {
        console.log(`  [FAIL] ${qc.label} - missing "${qc.mustContain}"`);
        failed++;
      }
    }
  }
}

// ─── Summary ───────────────────────────────────────────────────────────

console.log('\n' + '-'.repeat(70));
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log('-'.repeat(70));

process.exit(failed > 0 ? 1 : 0);
