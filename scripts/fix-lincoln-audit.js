#!/usr/bin/env node
/**
 * Apply audit findings to the 12 newly-added Lincoln pending_review entries.
 *
 * Audit via WebSearch (2026-05-23) — same workflow as Opel batch.
 * 9 verified clean, 3 needed NHTSA recall-number corrections (the
 * high-risk class of claim — same problem we saw on EV batch).
 *
 * Verdicts:
 *   ✓ lincoln-navigator-5.4l-3v-spark-plug-breakage
 *   ✓ lincoln-navigator-3.5l-ecoboost-timing-chain
 *   ✓ lincoln-navigator-air-suspension-failure
 *   ✓ lincoln-mkz-3.5l-water-pump-internal-leak
 *   ~ lincoln-mkz-hybrid-electric-power-steering  — wrong recall #; real is 15V-340 / Ford 15S18 (2011-12)
 *   ✓ lincoln-mkx-3.7l-water-pump-internal
 *   ~ lincoln-aviator-2020-multiple-recalls         — wrong driveshaft recall #; real is 20V-693 / Ford 20S65
 *   ✓ lincoln-aviator-rear-air-suspension
 *   ~ lincoln-continental-suicide-doors-recall     — "20V-630" doesn't exist; real is 19V-077 / Ford 19S03 (covers ALL 2017-2019 Continental doors incl. Coach)
 *   ✓ lincoln-town-car-air-suspension-failure
 *   ✓ lincoln-town-car-blend-door-actuator
 *   ✓ lincoln-ls-coolant-cross-leak-aj-v8
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

function range(start, end) {
  const arr = [];
  for (let y = start; y <= end; y++) arr.push(y);
  return arr;
}

const UPDATES = [
  {
    id: 'lincoln-mkz-hybrid-electric-power-steering',
    note: 'NHTSA 18V-153 does not exist for this issue. Real recall is 15V-340 (Ford code 15S18), covering 2011-2012 Fusion and MKZ (393,623 vehicles) for loss of EPS assist. Narrower year range than I originally stated. Source: static.nhtsa.gov/odi/rcl/2015/RCLRPT-15V340-7526.PDF.',
    fields: {
      years: range(2011, 2012),
      title: 'MKZ EPS Loss of Assist (NHTSA Recall 15V-340 / Ford 15S18)',
      description: 'Ford issued NHTSA recall 15V-340 (Ford reference 15S18) for 2011-2012 Fusion and MKZ to address sudden loss of electric power steering assist. Root cause: intermittent electrical connections in the steering gear motor due to conformal coat contamination and ribbon-cable pin misalignment, leading to loss of motor position signal. Approximately 393,623 vehicles covered.',
      solution: 'Check VIN at NHTSA recall lookup (15V-340). Remedy: dealer inspects the Power Steering Control Module (PSCM) for diagnostic trouble codes — if loss-of-assist DTCs are present, the entire steering gear is replaced free under recall; otherwise, the PSCM software is updated. Some owners also qualify for a Ford Customer Satisfaction Program (15S18) extending coverage on the steering gear.',
    },
  },
  {
    id: 'lincoln-aviator-2020-multiple-recalls',
    note: 'NHTSA "20V-303" was wrong. Real driveshaft weld recall is 20V-693 (Ford code 20S65), covering 2020 Aviator + Explorer with 2.0L or 3.3L + 10-speed AWD. ~52,000 vehicles. Source: oemdtc.com/6851 and static.nhtsa.gov/odi/rcl/2020/RCLRPT-20V770-5221.PDF.',
    fields: {
      title: 'Aviator Early-Build Recalls — Driveshaft Weld (NHTSA 20V-693), plus other 2020 actions',
      description: '2020 Aviator launches were affected by several recalls. Most serious: NHTSA 20V-693 (Ford 20S65) covering 2020 Aviator and Explorer with 2.0L or 3.3L engines plus 10-speed automatic AWD — the rear driveshaft may not have been welded properly, can fracture along the weld seam causing loss of drive, vehicle rollaway in Park, or impact with the fuel tank. A separate set of stop-sale actions in 2019-2020 covered second-row seat-back recliner welds, brake hose pinch, and battery fasteners. Many early owners experienced multiple dealer visits in the first year.',
      solution: 'Check VIN against NHTSA recalls lookup — multiple campaigns may apply (20V-693 most serious). All remedies are free under recall. Dealer inspects the rear driveshaft and replaces if necessary. Request a full recall history printout from a Lincoln dealer if you own a 2020 Aviator and have had no recall service.',
    },
  },
  {
    id: 'lincoln-continental-suicide-doors-recall',
    note: 'NHTSA "20V-630" does not exist as I stated. The actual recall covering Continental Coach Door (rear-hinged) latches is 19V-077 (Ford 19S03), which covers ALL four doors on 2017-2019 Continentals (~27,000 vehicles) — silicon contamination causes the e-latch motor to fail intermittently, including potentially while moving. The Coach Door variants (very limited build) are a subset within this recall. No separate Coach-Door-only recall exists. Source: 19V077000 (justia, repairpal, oemdtc).',
    fields: {
      years: range(2017, 2019),
      trims: ['Premiere', 'Select', 'Reserve', 'Black Label', '30H', '80th Anniversary'],
      title: 'Continental Door Latch Recall (NHTSA 19V-077 / Ford 19S03) — Affects Coach Doors Too',
      description: 'NHTSA recall 19V-077 (Ford reference 19S03) covers ~27,000 2017-2019 Lincoln Continentals built Nov 30 2015 - Nov 14 2018 at Ford\'s Flat Rock plant. Silicon contamination causes the electronic door-latch pawl motor to work intermittently or fail, which can lead to a door that will not close, a persistent "door ajar" warning, or — worst case — a door opening while the vehicle is in motion. All four doors are affected. The rare Coach Door (rear-hinged) Edition variants are covered as a subset of the same recall.',
      solution: 'Check VIN at NHTSA recalls lookup (19V-077). Free dealer remedy: replacement of latch assemblies on all four doors. Until repaired, treat every door warning seriously — do not transport passengers if rear doors will not securely latch. Recall began March 2019.',
    },
  },
];

const COL_MAP = {
  title: 'title',
  description: 'description',
  solution: 'solution',
  severity: 'severity',
  years: 'years',
  trims: 'trims',
  dtcCodes: '"dtcCodes"',
  confidence: 'confidence',
  estimatedCostLow: '"estimatedCostLow"',
  estimatedCostHigh: '"estimatedCostHigh"',
  typicalMileageLow: '"typicalMileageLow"',
  typicalMileageHigh: '"typicalMileageHigh"',
};

async function main() {
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Apply Lincoln Audit Fixes (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log(`  Target: ${UPDATES.length} entries (out of 12 audited)`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  let applied = 0;
  for (const u of UPDATES) {
    const before = (await pool.query(`SELECT id, status FROM "KnownIssue" WHERE id = $1`, [u.id])).rows[0];
    if (!before) { console.log(`  ✗ ${u.id} — not found`); continue; }
    console.log(`  ${APPLY ? '✓' : '·'} ${u.id}  [${before.status}]`);
    console.log(`    note: ${u.note.slice(0, 200)}${u.note.length > 200 ? '...' : ''}`);

    if (APPLY) {
      const sets = [];
      const params = [];
      let i = 1;
      for (const [k, v] of Object.entries(u.fields)) {
        const col = COL_MAP[k];
        if (!col) continue;
        params.push(v);
        sets.push(`${col} = $${i++}`);
      }
      sets.push(`"updatedAt" = NOW()`);
      params.push(u.id);
      await pool.query(`UPDATE "KnownIssue" SET ${sets.join(', ')} WHERE id = $${i}`, params);
    }
    applied++;
  }

  console.log(`\n${APPLY ? 'Applied' : 'Would apply'}: ${applied}`);
  console.log(`\nNext (after --apply): node scripts/publish-verified-issues.js --all-make Lincoln --apply`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
