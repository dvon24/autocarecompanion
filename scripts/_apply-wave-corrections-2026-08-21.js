#!/usr/bin/env node
/**
 * Apply the QA-gate corrections to wave 5 and wave 6 output. ZERO AI, auditable.
 * Every edit traces to a specific `_verdictReason` where the adversarial verifier CONFIRMED the
 * issue while stating a factual error inside it (surfaced by scripts/_qa-verdict-caveats.js).
 *
 * Usage: node scripts/_apply-wave-corrections-2026-08-21.js [--apply]
 */
const fs = require('fs');
const APPLY = process.argv.includes('--apply');
const W5 = 'data/research-wave5-2026-08-21-citychecked.json';
const W6 = 'data/research-wave6-2026-08-21-citychecked.json';
const load = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const log = [];
const find = (arr, make, frag) => arr.find((i) => i.make === make && i.title.includes(frag));

const d5 = load(W5);
const d6 = load(W6);
const w5 = d5.result.confirmed;
const w6 = d6.result.confirmed;

// W5-1  Hyundai Accent rod bearing - REMOVE the unfounded warranty/settlement coverage claim.
// Verifier: "the Accent is NOT listed in the GDI class settlement covered-vehicle list nor in
// KSDS Campaign 966/982 coverage". As written it sends owners to demand a free short block.
{
  const x = find(w5, 'Hyundai', 'Connecting-Rod Bearing');
  const oldD = 'The 1.6L Gamma GDI was also named in the Hyundai/Kia GDI engine-failure class settlement alongside the Theta II 2.4 and Nu 2.0.';
  const newD = 'Hyundai deployed KSDS software and an engine warranty extension across several of its GDI engine families, but the Accent is NOT on the published covered-vehicle lists for KSDS Campaign 966/982 or the Hyundai/Kia GDI engine-failure settlement. Do not assume this car is covered - verify your VIN with Hyundai before expecting a free repair.';
  if (x && x.description.includes(oldD)) {
    x.description = x.description.replace(oldD, newD);
    log.push('W5-1 description: removed unfounded settlement-coverage claim');
  }
  const oldS = 'Have the dealer confirm and perform the KSDS software campaign (966/982) first - it is a prerequisite for the extended engine warranty (up to 15yr/150k mi on short block on qualifying vehicles). If the MIL blinks or a bearing knock is present, request a dealer engine inspection with an oil-pan/bearing check; a qualifying vehicle gets a short-block or long-block replacement under the warranty extension.';
  const newS = 'First have a Hyundai dealer run your VIN against any open campaign or warranty extension - the Accent is not on the published KSDS 966/982 or GDI settlement lists, so coverage cannot be assumed and must be checked per VIN. If the MIL blinks or a bearing knock is present, request a dealer engine inspection with an oil-pan/bearing check; where a car does qualify, the remedy is a short-block or long-block replacement.';
  if (x && x.solution.includes(oldS)) {
    x.solution = x.solution.replace(oldS, newS);
    log.push('W5-1 solution: removed "prerequisite for extended warranty" claim');
  }
}

// W5-2  Accent oil consumption - drop the citation that is a Sonata 2.4 Theta thread; soften figure.
{
  const x = find(w5, 'Hyundai', 'Excessive Oil Consumption');
  if (x) {
    const before = x.citations.length;
    x.citations = x.citations.filter((c) => !c.url.includes('672628'));
    if (x.citations.length < before) log.push('W5-2 dropped citation 672628 (Sonata 2.4 Theta thread, not the 1.6 GDI)');
    const oldT = 'burning a quart of oil in as little as 500-1,000 miles';
    const newT = 'burning a quart of oil in as little as 1,000 miles in the most severe reports';
    if (x.description.includes(oldT)) {
      x.description = x.description.replace(oldT, newT);
      log.push('W5-2 softened the extreme oil-consumption figure');
    }
  }
}

// W5-3  VW Taos - "Travel Assist unavailable" is the steering-wheel capacitive sensor mat
// (TSB 48-23-01), NOT the front radar/camera. Remove it from this issue's symptoms.
{
  const x = find(w5, 'Volkswagen', 'False Front Assist');
  if (x) {
    const before = x.symptoms.length;
    x.symptoms = x.symptoms.filter((s) => !/Travel Assist/i.test(s));
    if (x.symptoms.length < before) log.push('W5-3 removed "Travel Assist unavailable" symptom (different root cause: TSB 48-23-01)');
  }
}

// W5-4  Audi Q7 - the specific TSB number is uncertain across sources; remove/soften it.
{
  const x = find(w5, 'Audi', 'Hydro-Bushing');
  if (x) {
    if (x.title.includes(' (TSB 2058489)')) {
      x.title = x.title.replace(' (TSB 2058489)', '');
      log.push('W5-4 removed uncertain TSB number from title');
    }
    if (x.solution.includes('2058489')) {
      x.solution = x.solution.split('TSB 2058489').join('the applicable Audi TSB (have the dealer look it up by symptom - sources disagree on the bulletin number)');
      log.push('W5-4 softened TSB reference in solution');
    }
  }
}

// W5-5  Cadillac CT4 - PIC6404 covers 2020 only, and the cadillacvnet citation is a different
// complaint (EPS rack on a 2022 CT4-V Blackwing, not camera comm loss).
{
  const x = find(w5, 'Cadillac', 'Steering Assist Reduced');
  if (x) {
    if (x.years.length > 1) {
      x.years = [2020];
      log.push('W5-5 years narrowed to [2020] (PIC6404 scope)');
    }
    const before = x.citations.length;
    x.citations = x.citations.filter((c) => !c.url.includes('cadillacvnet'));
    if (x.citations.length < before) log.push('W5-5 dropped cadillacvnet citation (different complaint)');
  }
}

// W5-6  Mercedes Sprinter - the sprinter-source citation is a T1N/pre-OM642 thread, wrong engine era.
{
  const x = find(w5, 'Mercedes-Benz', 'Water Pump and Thermostat');
  if (x) {
    const before = x.citations.length;
    x.citations = x.citations.filter((c) => !c.url.includes('showthread.php?t=16475'));
    if (x.citations.length < before) log.push('W5-6 dropped sprinter-source citation (T1N/pre-OM642, wrong engine era)');
  }
}

// W6-1  Mazda3 fuel pump - recall 21V875 covers the 2018 Mazda3 only; 2019 is other nameplates.
{
  const x = find(w6, 'Mazda', 'Denso Low-Pressure Fuel Pump');
  if (x) {
    if (x.years.includes(2019)) {
      x.years = x.years.filter((y) => y !== 2019);
      log.push('W6-1 dropped 2019 (recall 21V875 covers the 2018 Mazda3 only)');
    }
    if (x.title.includes('2018-2019')) {
      x.title = x.title.replace('2018-2019', '2018');
      log.push('W6-1 corrected title year range');
    }
  }
}

// W6-2  Ford Edge 8F35 - the 2.7L ST uses the 8F57, not the 8F35. Drop that engine.
{
  const x = find(w6, 'Ford', '8F35');
  if (x) {
    const before = x.engines.length;
    x.engines = x.engines.filter((e) => !e.includes('2.7'));
    if (x.engines.length < before) log.push('W6-2 dropped 2.7L EcoBoost ST (that car uses the 8F57, not the 8F35)');
  }
}

// W6-3  Mazda CX-50 liftgate - the claim understates that a module/software reset often clears it.
{
  const x = find(w6, 'Mazda', 'Power Liftgate Inoperative');
  const add = ' Before replacing parts, have the dealer try a liftgate control module reset/reprogram and a 12V battery health check - owners frequently report a reset clearing the three-beep fault with no hardware replaced.';
  if (x && !x.solution.includes('reset/reprogram')) {
    x.solution = x.solution.trimEnd() + add;
    log.push('W6-3 added module-reset-first guidance');
  }
}

console.log(APPLY ? 'APPLIED:' : 'DRY RUN (re-run with --apply):');
log.forEach((l) => console.log('  - ' + l));
console.log('\n' + log.length + ' edits');
if (APPLY) {
  fs.writeFileSync(W5.replace('.json', '-corrected.json'), JSON.stringify(d5, null, 2));
  fs.writeFileSync(W6.replace('.json', '-corrected.json'), JSON.stringify(d6, null, 2));
  console.log('wrote both *-corrected.json files');
}
