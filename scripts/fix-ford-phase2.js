#!/usr/bin/env node
/**
 * Ford Phase 2 — In-place fixes from audit-ford-claudecode.json.
 *
 * Per-entry corrections: recall ID typos, year range tightening,
 * description framing fixes. Each fix is anchored to specific audit
 * findings + WebSearch-verified facts (NHTSA recall numbers, etc.).
 *
 * Usage:
 *   node scripts/fix-ford-phase2.js              # dry-run
 *   node scripts/fix-ford-phase2.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

const UPDATES = [
  // ─── Recall ID corrections (highest-value factual fixes) ───
  {
    id: 'ford-broncosport-loss-of-power-recall-2021',
    note: 'Recall ID typo in title — actual is 24S24 (NHTSA 24V267000), not "24S2". Two follow-up recalls also covered: 25S02 (battery replacement, Jan 2025) and 25S26 (re-fix, Mar 2025).',
    fields: {
      title: 'Loss of Drive Power Due to 12V Battery Detection Failure (Recall 24S24 / NHTSA 24V267)',
      description: "NHTSA recall 24V267000 (Ford reference 24S24) covers 456,565 model year 2021-2024 Bronco Sport and 2022-2023 Maverick vehicles. The Body Control Module and Powertrain Control Module fail to detect 12V battery degradation, resulting in loss of motive power whenever an Auto Stop/Start event occurs or during low-speed braking. Two follow-up campaigns address inadequate initial remedies: 25S02 (NHTSA 25V019, January 2025) replaced defective Camel EFB batteries with Ford AGM units on 272,817 vehicles, and 25S26 (NHTSA 25V158, March 2025) re-fixed 12,833 vehicles previously repaired incorrectly. Dealers reflash control modules and/or replace the battery free of charge.",
    },
  },
  {
    id: 'ford-fusion-steering-rack-failure-2010',
    note: 'Year range was 2010-2020 (too broad). NHTSA recall 15V340 covers 2011-2013 Fusion (and Lincoln MKZ) WITHOUT 3.5L engine only. 2010 was excluded despite identical parts.',
    fields: {
      years: [2011, 2012, 2013],
      title: 'Electric Power Steering Rack Failure (Recall 15V340)',
      description: "NHTSA recall 15V340 covers 2011-2013 Ford Fusion (and Lincoln MKZ) without the 3.5L engine. An intermittent electrical connection in the steering gear can cause sudden loss of electric power steering assist while driving. Owners notice heavier steering effort especially at low speeds, increasing crash risk. Dealers check the Power Steering Control Module (PSCM) for DTCs; if any loss-of-assist codes are stored, the steering gear is replaced free. Note: 2010 Fusions had the same parts but were excluded from the recall — feds closed the probe without expanding scope. 2010-owner symptoms are real but uncovered by recall.",
    },
  },
  {
    id: 'ford-fusion-power-steering-failure-2013',
    note: 'Year range 2013-2018 partially overlaps with 15V340 scope (2011-2013). 2014-2018 Fusions have different EPS module revisions not covered by the recall.',
    fields: {
      years: [2013, 2014, 2015, 2016, 2017, 2018],
      description: "2014-2018 Ford Fusions use a different EPS module revision than the 2011-2013 recall (NHTSA 15V340) — but owners still report sudden loss of power steering assist, particularly at higher mileage. Without recall coverage, repairs are owner-paid: rack replacement typically $1,200-$2,000. Symptoms mirror the recalled generation (heavy steering, intermittent warnings, eventual full assist loss). For 2013 specifically, the 15V340 recall applies if the vehicle is without the 3.5L engine.",
    },
  },
  {
    id: 'ford-explorer-carbon-monoxide-exhaust-intrusion',
    note: 'NHTSA CLOSED the 6-year investigation in Jan 2023 WITHOUT issuing a recall. Ford was exonerated; CO ingress was traced to upfitter modifications and rear-end collision damage. Ford did issue Field Service Action 17B25 for sealing fixes on Police Interceptors.',
    fields: {
      title: 'Exhaust Fumes / Carbon Monoxide Cabin Intrusion (NHTSA Investigation Closed Without Recall)',
      description: "NHTSA opened an investigation in July 2016 into 2011-2017 Ford Explorer carbon monoxide intrusion after 6,500+ complaints, 657 alleged injuries, and 3 deaths. After 6 years of testing, NHTSA closed the investigation in January 2023 WITHOUT a recall — agency findings concluded that CO levels in the cabin met current health standards in correctly-configured vehicles, and elevated levels traced to (a) aftermarket upfitter modifications on Police Interceptor variants and (b) rear-end collision damage compromising exhaust seals. Ford issued Field Service Action 17B25 (NOT a recall) for affected Police Interceptors, addressing sealing issues and adding HVAC reprogramming. Consumer Explorers were generally cleared. Owners experiencing odors should have the exhaust system inspected for collision damage or aftermarket leaks; sealing repairs and HVAC reprogramming are available.",
    },
  },

  // ─── Year-range tightening (factual scope corrections) ───
  {
    id: 'ford-focus-rear-wheel-bearing-2000',
    note: 'Year range 2000-2018 spans 2 distinct platforms (Mk1/Mk1.5 1999-2007 and Mk3 2012-2018). Forum reports cluster heavily in Mk1. Mk3 has separate documented bearing issues. Tightening to Mk1 era; Mk3 should be its own entry.',
    fields: {
      years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007],
      title: 'Rear Wheel Bearing Premature Failure (1st-Generation Mk1/Mk1.5)',
      description: "1999-2007 Ford Focus (1st-generation Mk1 and Mk1.5) suffer from repeated rear wheel bearing failures, often within months of replacement. One Focus Fanatics owner reported the left rear wheel bearing failing 4 times in 7 months. Root cause is missing or degraded inboard spindle seals that allow brake dust and water into the bearing race, plus alignment drift (excessive negative camber or toe) accelerating wear. Ford acknowledged the seal design in owner communities but never issued a formal recall. Replacement requires the full hub assembly. The 2012-2018 Mk3 Focus has separate bearing issues with different root causes (not covered by this entry).",
    },
  },
  {
    id: 'ford-f-150-window-regulator-failure-and-sudden-glass-drop',
    note: 'Year range 2004-2004 too narrow — issue spans 2004-2008 (11th-gen F-150). CarComplaints + multiple F-150 forums confirm cable take-up reel failure affects driver-side rear + front passenger.',
    fields: {
      years: [2004, 2005, 2006, 2007, 2008],
      title: 'Window Regulator Cable Failure and Sudden Glass Drop (11th-Gen F-150)',
      description: "2004-2008 Ford F-150 (11th-generation) suffer from window regulator cable take-up reel failure, causing the window glass to drop suddenly from the closed position — sometimes at highway speeds with a loud bang. The cable frays and bird-nests on the reel, releasing tension on the glass. Driver-side rear and front passenger windows are most commonly affected. Multiple windows on a single vehicle often fail in succession. Ford dealers report replacing 1-2 regulators per week per service department during the peak failure window. Despite extensive complaints, Ford never issued a recall. Replacement cost: $250-$450 per window at independent shops, $400-$700 at dealer.",
    },
  },
  {
    id: 'ford-f-150-fuel-pump-driver-module-corrosion-and-no-start-stall',
    note: 'Year range 2004-2004 too narrow — FPDM corrosion spans 2004-2009 F-150 with Ford recall for 2005-2006 specifically. Galvanic corrosion (aluminum housing on steel frame crossmember) is the root cause.',
    fields: {
      years: [2004, 2005, 2006, 2007, 2008, 2009],
      title: 'Fuel Pump Driver Module (FPDM) Corrosion and No-Start / Stalling',
      description: "2004-2009 Ford F-150 (11th-generation) suffers from Fuel Pump Driver Module (FPDM) corrosion. The aluminum-housed module mounts directly to a steel frame crossmember above the spare tire — the dissimilar-metal contact creates galvanic corrosion, accelerated by road salt and moisture. The aluminum case cracks, water shorts the internal circuit board, and the module stops driving the fuel pump. Symptoms: crank-no-start (most common), stalling after hitting a bump or stopping at lights, intermittent loss of power. Ford issued a recall for 2005-2006 F-150 FPDMs specifically; 2004 and 2007-2009 are not recall-covered but suffer the same defect. Owners typically pay $150-$400 for module replacement plus relocation hardware that mounts the module away from the steel frame.",
    },
  },
  {
    id: 'ford-f-150-brake-line-hose-and-hydraulic-component-failure',
    note: 'Year range 2004-2004 too narrow; brake line corrosion on F-150 spans the 11th-gen (2004-2008) and into 12th-gen (2009-2014) in salt-belt states.',
    fields: {
      years: [2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
      title: 'Brake Line Corrosion and Hydraulic Failure (Salt-Belt 11th/12th-Gen F-150)',
      description: "2004-2014 Ford F-150 brake lines, hoses, and ABS hydraulic components corrode aggressively in salt-belt states. Steel brake lines along the frame rust through, causing sudden loss of brake fluid and reduced or no pedal feel. Front and rear hard lines and rear axle flex hoses are most commonly affected. NHTSA has received numerous complaints but no recall has been issued — replacement is owner-paid ($800-$2,000+ depending on which lines need replacing). Most failures occur after 100,000 miles in northern/coastal states; southern-state trucks rarely show the pattern. Inspect annually if you drive in salt regions.",
    },
  },

  // ─── Description framing / engine generation distinction ───
  {
    id: 'ford-mustang-coyote-tick-noise-2015',
    note: 'Description should differentiate Gen 2 (2015-2017) Coyote tick from Gen 3 (2018+) which is louder and has different root cause (plasma arc liner / piston slap). Engine replacements documented on Gen 3 specifically.',
    fields: {
      description: "Two distinct tick patterns affect 5.0L Coyote V8 in 2015-2023 Mustang depending on engine generation. Gen 2 Coyote (2015-2017): light tick at idle and on cold start, commonly attributed to valve lash / lifter operation; generally cosmetic and not associated with engine damage. Gen 3 Coyote (2018-2023): louder, more pronounced tick — same family but Ford changed to plasma transferred wire arc (PTWA) cylinder liners. The tick is increasingly linked to piston slap from clearance issues against the plasma liner, with some confirmed cases of cylinder wall scoring requiring engine replacement under warranty. Direct injection (added on Gen 3 alongside port injection) contributes a separate fainter HPFP tick that is normal. Distinguishing: Gen 2 tick stays constant warm; Gen 3 piston slap diminishes as engine warms but returns under load. Owner forums (Mustang6G, MPR Racing Engines) document the Gen 3 pattern extensively.",
    },
  },

  // ─── Hybrid generation split (Fusion Hybrid spans 2 gens) ───
  {
    id: 'ford-fusion-hybrid-battery-degradation-2010',
    note: 'Year range 2010-2020 spans 2 generations of Fusion Hybrid with different HV battery packs. 1st-gen 2010-2012 used NiMH; 2nd-gen 2013-2020 switched to Li-ion. Different degradation patterns.',
    fields: {
      description: "Ford Fusion Hybrid spans two generations with different high-voltage batteries — degradation patterns differ. 1st-gen 2010-2012 (NiMH, ~1.4 kWh): typical degradation appears at 100,000-150,000 miles with reduced EV-mode range and increased ICE intervention. Replacement runs $2,500-$4,000 at independent hybrid specialists. 2nd-gen 2013-2020 (Lithium-ion, ~1.4 kWh): better thermal management has led to longer life on average but cell imbalance issues appear at 150,000+ miles. 'Stop Safely Now' warnings often precede full failure. 2013-2020 Energi PHEV variants share the architecture but with larger 7.6 kWh batteries — separate degradation curve. Owners should check cell balance via OBD-II scanner with hybrid module support (Forscan recommended).",
    },
  },

  // ─── Description tightening ───
  {
    id: 'ford-broncosport-15-oil-dilution-2021',
    note: 'Title says oil dilution but the actual NHTSA recalls and Ford service campaigns are: oil separator housing cracking (22S21, 345k vehicles) and fuel injector cracking. Oil dilution is real but handled via CSP 21N12 (10-year extended warranty, age/mileage capped).',
    fields: {
      title: '1.5L EcoBoost 3-Cylinder Engine Issues — Oil Dilution + Oil Separator + Fuel Injector (Recalls 22S21 + Injector)',
      description: "2021-2025 Ford Bronco Sport with the 1.5L EcoBoost 3-cylinder engine has three overlapping documented issues: (1) Oil separator housing cracking — NHTSA recall 22S21 covers 345,451 vehicles (2020-2022 Escape + 2021-2022 Bronco Sport) for cracked oil separator housings causing oil leaks and fire risk; dealers inspect and replace under warranty. (2) Fuel injector cracking — separate recall covers 2020-2023 Escape and Bronco Sport for cracked injectors leaking fuel near hot exhaust components. (3) Oil dilution from short-trip driving — unburned fuel washes past the rings into the crankcase, causing oil level to RISE above the full mark with gasoline smell on dipstick. Ford handled the oil dilution issue via Customer Satisfaction Program 21N12, which offers a one-time 10-year engine replacement covenant capped by age/mileage (many second-owner vehicles fall outside). Owners experiencing rising oil level or fuel smell should document via dealer service writes and request CSP 21N12 evaluation.",
    },
  },
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Ford Phase 2 In-Place Fixes (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log(`  Target: ${UPDATES.length} entries`);
  console.log('═══════════════════════════════════════════════════════════\n');

  const colMap = {
    title: 'title',
    description: 'description',
    solution: 'solution',
    severity: 'severity',
    years: 'years',
    dtcCodes: '"dtcCodes"',
    estimatedCostLow: '"estimatedCostLow"',
    estimatedCostHigh: '"estimatedCostHigh"',
  };

  let applied = 0, notFound = 0;
  for (const u of UPDATES) {
    const before = (await pool.query(`SELECT id, status, title, years FROM "KnownIssue" WHERE id = $1`, [u.id])).rows[0];
    if (!before) { console.log(`  ✗ ${u.id} — not found`); notFound++; continue; }
    if (before.status !== 'published') { console.log(`  ~ ${u.id} — not published (${before.status})`); continue; }

    console.log(`  ${APPLY ? '✓' : '·'} ${u.id}`);
    console.log(`    note: ${u.note.slice(0, 200)}${u.note.length > 200 ? '...' : ''}`);
    for (const k of Object.keys(u.fields)) {
      const oldVal = before[k] === undefined ? '(not selected)' : JSON.stringify(before[k]).slice(0, 80);
      console.log(`    ${k}: ${oldVal} → (updated)`);
    }

    if (APPLY) {
      const sets = [];
      const params = [];
      let i = 1;
      for (const [k, v] of Object.entries(u.fields)) {
        const col = colMap[k];
        if (!col) continue;
        params.push(v);
        sets.push(`${col} = $${i++}`);
      }
      sets.push(`"updatedAt" = NOW()`);
      params.push(u.id);
      await pool.query(`UPDATE "KnownIssue" SET ${sets.join(', ')} WHERE id = $${i}`, params);
      applied++;
    } else {
      applied++;
    }
  }

  console.log(`\n${APPLY ? 'Applied' : 'Would apply'}: ${applied}, Not found: ${notFound}`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
