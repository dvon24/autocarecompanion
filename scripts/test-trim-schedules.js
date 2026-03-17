/**
 * Quick test to verify trim-based maintenance schedule resolution.
 */

const overrides = require('../src/data/maintenance-overrides.json');

function getOverride(typeId, vehicle) {
  const makeData = overrides.makes[vehicle.make];
  if (!makeData) return { source: 'none', value: null };

  const modelData = makeData.models?.[vehicle.model];

  // 1. Check trim-level with scoring
  if (modelData?.trims && vehicle.trim) {
    const trimLower = vehicle.trim.toLowerCase();
    let bestMatch = null;

    for (const [trimKey, trimData] of Object.entries(modelData.trims)) {
      if (trimData.years && !trimData.years.includes(vehicle.year)) continue;

      const aliases = trimKey.toLowerCase().split('/').map(s => s.trim());
      let score = 0;

      for (const alias of aliases) {
        if (!alias) continue;
        if (trimLower === alias) { score = Math.max(score, 100); continue; }
        if (trimLower.includes(alias)) { score = Math.max(score, 50 + alias.length); continue; }
        if (alias.includes(trimLower)) { score = Math.max(score, 40 + trimLower.length); continue; }
        const trimWords = trimLower.split(/[\s\-_,]+/).filter(Boolean);
        const aliasWords = alias.split(/[\s\-_,]+/).filter(Boolean);
        const wordMatches = trimWords.filter(tw => aliasWords.some(aw => tw === aw));
        if (wordMatches.length > 0) {
          score = Math.max(score, 20 + wordMatches.length * 5 + wordMatches.join('').length);
        }
      }

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { key: trimKey, data: trimData, score };
      }
    }

    if (bestMatch && bestMatch.data[typeId] !== undefined) {
      return { source: `trim: ${bestMatch.key} (score:${bestMatch.score})`, value: bestMatch.data[typeId] };
    }
  }

  // 2. Model _defaults or flat
  if (modelData) {
    if (modelData._defaults?.[typeId] !== undefined) {
      return { source: 'model._defaults', value: modelData._defaults[typeId] };
    }
    if (modelData[typeId] !== undefined && typeId !== 'trims' && typeId !== '_defaults' && typeId !== 'engine') {
      return { source: 'model (flat)', value: modelData[typeId] };
    }
  }

  // 3. Make _defaults
  if (makeData._defaults?.[typeId] !== undefined) {
    return { source: 'make._defaults', value: makeData._defaults[typeId] };
  }

  return { source: 'global default', value: null };
}

const tests = [
  // Your Camaro ZL1 — should get supercharged schedule
  { vehicle: { make: 'Chevrolet', model: 'Camaro', year: 2019, trim: 'ZL1 1LE' }, type: 'oil_change',
    expectSource: 'ZL1', expectNote: '10 quarts' },
  // Camaro SS — should get LT1 schedule
  { vehicle: { make: 'Chevrolet', model: 'Camaro', year: 2020, trim: 'SS' }, type: 'oil_change',
    expectSource: 'SS', expectNote: '10 quarts' },
  // Camaro LT — should get 2.0T schedule
  { vehicle: { make: 'Chevrolet', model: 'Camaro', year: 2020, trim: 'LT' }, type: 'oil_change',
    expectSource: 'LT', expectNote: '5 quarts' },
  // Camaro no trim — should fall back to model _defaults
  { vehicle: { make: 'Chevrolet', model: 'Camaro', year: 2020 }, type: 'oil_change',
    expectSource: 'model._defaults', expectNote: null },
  // F-150 Raptor — should get severe duty differentials
  { vehicle: { make: 'Ford', model: 'F-150', year: 2022, trim: 'Raptor' }, type: 'differential_fluid',
    expectSource: 'Raptor', expectNote: 'Severe' },
  // Mustang GT350 — 5W-50 required (must NOT match GT)
  { vehicle: { make: 'Ford', model: 'Mustang', year: 2019, trim: 'Shelby GT350' }, type: 'oil_change',
    expectSource: 'GT350', expectNote: '5W-50' },
  // Challenger Hellcat — supercharger schedule (must NOT match R/T)
  { vehicle: { make: 'Dodge', model: 'Challenger', year: 2021, trim: 'SRT Hellcat Redeye' }, type: 'oil_change',
    expectSource: 'Hellcat', expectNote: '6000' },
  // RAV4 Hybrid — no serpentine belt
  { vehicle: { make: 'Toyota', model: 'RAV4', year: 2023, trim: 'Hybrid XSE' }, type: 'serpentine_belt',
    expectSource: 'Hybrid', expectNote: 'notApplicable' },
  // WRX STI — 3000mi oil change
  { vehicle: { make: 'Subaru', model: 'WRX', year: 2020, trim: 'STI' }, type: 'oil_change',
    expectSource: 'STI', expectNote: '3000' },
  // BMW M3 — short plug interval
  { vehicle: { make: 'BMW', model: '3 Series', year: 2023, trim: 'M3 Competition' }, type: 'spark_plugs',
    expectSource: 'M3', expectNote: '36000' },
  // RAM 1500 Laramie — should match HEMI (most Laramies are 5.7)
  { vehicle: { make: 'RAM', model: '1500', year: 2022, trim: 'Laramie' }, type: 'spark_plugs',
    expectSource: 'Laramie', expectNote: '16' },
  // Silverado diesel — no spark plugs
  { vehicle: { make: 'Chevrolet', model: 'Silverado 1500', year: 2023, trim: 'LTZ Duramax' }, type: 'spark_plugs',
    expectSource: 'Diesel', expectNote: 'notApplicable' },
  // Tacoma no trim — falls back to model _defaults
  { vehicle: { make: 'Toyota', model: 'Tacoma', year: 2022 }, type: 'transfer_case_fluid',
    expectSource: 'model._defaults', expectNote: null },
  // Civic Type R — shorter interval
  { vehicle: { make: 'Honda', model: 'Civic', year: 2023, trim: 'Type R' }, type: 'oil_change',
    expectSource: 'Type R', expectNote: '5000' },
  // Wrangler Rubicon 392 — HEMI in a Jeep
  { vehicle: { make: 'Jeep', model: 'Wrangler', year: 2022, trim: 'Rubicon 392' }, type: 'oil_change',
    expectSource: 'Rubicon 392', expectNote: '0W-40' },
];

console.log('Testing trim-based maintenance schedule resolution:\n');
let pass = 0, fail = 0;

for (const test of tests) {
  const result = getOverride(test.type, test.vehicle);
  const v = test.vehicle;
  const label = `${v.year} ${v.make} ${v.model} ${v.trim || '(no trim)'} → ${test.type}`;
  const note = result.value?.note || String(result.value?.intervalMiles ?? (result.value?.notApplicable ? 'N/A' : 'null'));

  const sourceMatch = test.expectSource ? result.source.toLowerCase().includes(test.expectSource.toLowerCase()) : true;
  const noteMatch = test.expectNote ? note.toLowerCase().includes(test.expectNote.toLowerCase()) : true;
  const ok = sourceMatch && noteMatch;

  if (ok) {
    pass++;
    console.log(`  PASS: ${label}`);
    console.log(`    → ${result.source} | ${note}\n`);
  } else {
    fail++;
    console.log(`  FAIL: ${label}`);
    console.log(`    → ${result.source} | ${note}`);
    console.log(`    Expected source containing "${test.expectSource}", note containing "${test.expectNote}"\n`);
  }
}

console.log(`Results: ${pass} pass, ${fail} fail out of ${tests.length} tests`);
