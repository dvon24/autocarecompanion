#!/usr/bin/env node
/**
 * Apply manual fixes to the 3 issues flagged by the audit-issues-sample.js run:
 *
 * 1. bmw-n55-water-pump-2012 (major):
 *    - Trims list incorrectly grouped 335d (N57 diesel), 340i and M340i (B58)
 *      with the actual N55-equipped 335i. Drop the non-N55 trims.
 *    - DTCs P0128/P2181 were generic cooling codes. Real BMW-specific water
 *      pump faults are 2E81-2E85 + 377A. Replace.
 *    - typicalMileageLow 60000 too high — verified failures from 30k onward.
 *    - Description had vague "BMW extended warranty coverage on some
 *      vehicles" claim with no specific campaign; tightened.
 *
 * 2. ford-superduty-67-def-scr-failure-2015 (major):
 *    - dtcCodes [P0401, P0402, P0403, P0404] are EGR flow/circuit codes,
 *      completely unrelated to the DEF/SCR issue the title + description
 *      describe. The real codes (P207F, P20EE) are already in the title.
 *    - estimatedCostLow $30 (DEF refill) was misleading; real SCR repairs
 *      start at ~$3000 per Ford CSP quotes (21M01, 21N02, 21N05).
 *
 * 3. mercedes-gle-transfer-case-actuator-2016 (fabricated):
 *    - P1744 is a Torque Converter Clutch code across manufacturers, not a
 *      transfer case actuator code.
 *    - Described failure mode matches BMW xDrive, not Mercedes 4MATIC.
 *    - 2016+ GLE actually has chain stretch + bearing wear as the
 *      documented transfer case issue. No NHTSA / TSB / forum threads
 *      support the "actuator motor failure" claim.
 *    - GLE53 AMG didn't exist until 2020 MY.
 *    Rewrite to the real chain/bearing issue so the URL stays alive with
 *    accurate content rather than 404'ing an indexed page.
 *
 * Usage:
 *   node scripts/fix-audit-flagged.js              # dry-run (prints diffs)
 *   node scripts/fix-audit-flagged.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

const FIXES = [
  {
    id: 'bmw-n55-water-pump-2012',
    fields: {
      trims: ['335i'], // only N55-equipped model; 335d uses N57 diesel, 340i/M340i use B58
      dtcCodes: ['2E81', '2E82', '2E83', '2E84', '2E85', '377A', 'P0128', 'P2181'], // BMW-specific first, then generic cooling codes as secondary signals
      typicalMileageLow: 30000,
      description: 'The electric water pump is a known failure point on N55 engines, typically failing anywhere from 30,000 to 100,000 miles. When it fails the engine can overheat quickly, with no mechanical belt-drive fallback (the pump is purely electric). Forum reports document failures clustered around 60-90k miles but also confirmed as early as 30k.',
    },
  },
  {
    id: 'ford-superduty-67-def-scr-failure-2015',
    fields: {
      dtcCodes: ['P207F', 'P20EE', 'P204F'], // SCR system codes that actually correspond to the title; P204F (Reductant System Performance) is also commonly thrown alongside
      estimatedCostLow: 3000, // SCR replacement / CSP-eligible repair, not a DEF refill
    },
  },
  {
    id: 'mercedes-gle-transfer-case-actuator-2016',
    fields: {
      title: '4MATIC Transfer Case Chain Stretch and Bearing Wear',
      description: 'The 4MATIC transfer case on 2016+ GLE develops two related failures over time: stretched drive chains (which cause a metallic rattle or grinding noise from under the vehicle, most audible at low speeds or under light acceleration) and worn output-shaft bearings (which produce a whine that changes pitch with vehicle speed). Severe wear can cause torque-distribution problems and, if ignored, eventual transfer case failure requiring full unit replacement.',
      solution: 'Diagnose with a stethoscope or chassis ear to confirm the noise originates from the transfer case (rather than the rear differential or driveshaft carrier bearing). Drain and inspect the transfer case fluid: metal flakes confirm internal wear. Early chain stretch can sometimes be addressed with a fluid change and a chain replacement; advanced bearing wear typically requires full transfer case replacement. OEM Mercedes transfer cases run $3,000-$6,000 plus 4-8 hours labor; rebuilt units from specialty shops are 30-50% cheaper.',
      dtcCodes: [], // no specific code reliably identifies this; P1744 (TCC code) was wrong
      severity: 'medium',
      estimatedCostLow: 2000,
      estimatedCostHigh: 7000,
      typicalMileageLow: 60000,
      typicalMileageHigh: 120000,
      trims: ['GLE350 4MATIC', 'GLE450 4MATIC'], // dropped GLE53 AMG (didn't exist until 2020 MY); these are the 4MATIC-equipped trims with the documented issue
    },
  },
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Audit Fix Application (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log('═══════════════════════════════════════════════════════════\n');

  for (const fix of FIXES) {
    const before = (await pool.query(
      `SELECT id, title, trims, "dtcCodes", "typicalMileageLow", "typicalMileageHigh", "estimatedCostLow", "estimatedCostHigh", description, solution, severity FROM "KnownIssue" WHERE id = $1`,
      [fix.id],
    )).rows[0];
    if (!before) {
      console.log(`✗ ${fix.id}: not found in DB`);
      continue;
    }
    console.log(`\n━━━ ${fix.id} ━━━`);
    for (const [k, v] of Object.entries(fix.fields)) {
      const oldVal = before[k] === undefined ? 'undefined' : JSON.stringify(before[k]);
      const newVal = JSON.stringify(v);
      if (oldVal === newVal) {
        console.log(`  ${k}: no change`);
      } else {
        console.log(`  ${k}:`);
        console.log(`    - ${oldVal.slice(0, 120)}${oldVal.length > 120 ? '...' : ''}`);
        console.log(`    + ${newVal.slice(0, 120)}${newVal.length > 120 ? '...' : ''}`);
      }
    }

    if (APPLY) {
      const sets = [];
      const params = [];
      let i = 1;
      // Map JS-side field name to the actual DB column name (most match
      // but a few need quoting since Postgres folds unquoted identifiers
      // to lowercase).
      const colMap = {
        title: 'title',
        trims: 'trims',
        dtcCodes: '"dtcCodes"',
        description: 'description',
        solution: 'solution',
        severity: 'severity',
        estimatedCostLow: '"estimatedCostLow"',
        estimatedCostHigh: '"estimatedCostHigh"',
        typicalMileageLow: '"typicalMileageLow"',
        typicalMileageHigh: '"typicalMileageHigh"',
      };
      for (const [k, v] of Object.entries(fix.fields)) {
        const col = colMap[k];
        if (!col) {
          console.log(`  ⚠  no column mapping for ${k}, skipping`);
          continue;
        }
        params.push(v);
        sets.push(`${col} = $${i++}`);
      }
      sets.push(`"updatedAt" = NOW()`);
      params.push(fix.id);
      const sql = `UPDATE "KnownIssue" SET ${sets.join(', ')} WHERE id = $${i}`;
      try {
        await pool.query(sql, params);
        console.log(`  ✓ applied`);
      } catch (err) {
        console.log(`  ✗ DB error: ${err.message}`);
      }
    }
  }

  await pool.end();
  console.log(APPLY ? '\nDone.' : '\n(dry-run — re-run with --apply to write)');
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
