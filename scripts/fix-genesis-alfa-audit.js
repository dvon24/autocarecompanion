#!/usr/bin/env node
/**
 * Apply the May 14 Genesis + Alfa Romeo audit findings.
 *
 * Genesis: 22 → 12 published (8 archived, 2 fixed in place, 2 parse errors retained)
 *   Audit found a strong "wrong suspension type" hallucination cluster — multiple
 *   issues claimed air suspension on cars that ship with Electronically Controlled
 *   Suspension (ECS, solenoid-valve dampers) instead. Only the 2023+ 2nd-gen G90
 *   actually offers air suspension, and even then only as an option.
 *
 * Alfa Romeo: 17 → 12 published (3 archived, 2 fixed in place, 2 parse errors retained)
 *   Audit found Giulia + Stelvio stall entries misattributed to ECM/wiring when
 *   the documented root cause is the low-pressure fuel pump (NHTSA recall
 *   25V-586 for Giulia, 25V-667 for Stelvio, FCA campaign 93C).
 *
 * Usage:
 *   node scripts/fix-genesis-alfa-audit.js              # dry-run
 *   node scripts/fix-genesis-alfa-audit.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

const ARCHIVE_IDS = [
  // ─── Genesis fabricated (5) ───
  'genesis-g80-35t-turbo-wastegate',           // wastegate rattle is Hyundai/Genesis Coupe 2.0T, not G80 3.3T
  'genesis-g80-air-suspension-compressor',     // G80 uses Electronically Controlled Suspension, not air
  'genesis-g90-rear-seat-entertainment',       // G90 RSE is fixed seatback screens fed by glovebox DVD — not tablets with HDMI
  'genesis-gv70-turbo-coolant-line',           // documented GV70 cooling issue is intercooler radiator road-debris damage (P26CB00), not coolant line
  'genesis-gv80-air-suspension-issues',        // GV80 uses ECS, not air suspension
  // ─── Genesis majors that turned out to be wrong-vehicle (3) ───
  'genesis-g90-air-suspension-failure',        // 1st-gen G90 has no air suspension
  'genesis-g90-elsd-noise',                    // e-LSD noise is GV70/GV80/G70, not G90 (G90 used HTRAC)
  'genesis-gv80-transmission-shudder',         // GM 8L90 shudder copied to a Genesis platform that doesn't use that transmission
  // ─── Alfa Romeo fabricated (2) ───
  'alfa-romeo-giulia-window-regulator',        // not a documented systemic Giulia issue
  'alfa-romeo-tonale-suspension-noise',        // documented Tonale issues are PHEV/ADAS/software, not suspension clunk
  // ─── Alfa Romeo wrong-component (1) ───
  'alfa-romeo-4c-headlight-condensation',      // 4C has bi-xenon/halogen not LED; single forum post is not a systemic issue
];

const UPDATES = [
  // ─── Genesis fixes ───
  {
    id: 'genesis-g70-turbo-oil-line-leak',
    note: 'NHTSA recall 24V-191 (Genesis Recall 019G) covers 2019-2022 G70 3.3T only — 2023+ shipped stainless steel pipes and are excluded. Defect is the LH turbo oil feed line; original description was vague.',
    fields: {
      years: [2019, 2020, 2021, 2022],
      title: 'Left Turbocharger Oil Feed Line Leak (Recall 24V-191)',
      description: "On 3.3T 2019-2022 G70s, the left turbocharger's oil feed pipe assembly can degrade and leak under sustained heat cycling. Oil contacting hot exhaust components creates a fire hazard. NHTSA recall 24V-191 (Genesis campaign 019G) covers free replacement with a redesigned stainless steel pipe — the same pipe Genesis fitted from the factory on 2023+ cars, which is why the recall excludes those years. Symptoms include burning-oil smell from the engine bay, oil pooling on the underbody shield, and intermittent oil pressure warnings.",
      severity: 'high',
    },
  },
  {
    id: 'genesis-gv70-infotainment-freeze',
    note: 'NHTSA classified the GV70 infotainment freeze as a safety recall (FMVSS 101 non-compliance) — instrument cluster can reboot while driving, hiding speed and warnings. Severity must reflect that.',
    fields: {
      severity: 'high',
    },
  },
  // ─── Alfa Romeo fixes ───
  {
    id: 'alfa-romeo-giulia-stall',
    note: 'Documented root cause is the low-pressure fuel pump / fuel delivery module — NHTSA recall 25V-586 (FCA campaign 93C). Previous description blamed ECM/wiring with DTC P0606 + U0100, both wrong.',
    fields: {
      title: 'Low-Pressure Fuel Pump Failure Causing Stall (Recall 25V-586)',
      description: "2017+ Giulias can experience sudden engine stall or no-start due to a defective low-pressure fuel pump inside the fuel delivery module. The pump's internal commutator wears prematurely and loses contact, cutting fuel supply at any speed. NHTSA recall 25V-586 (Stellantis campaign 93C) covers free replacement. Symptoms include stalling at idle, no-start hot, and intermittent fuel pump prime noise from the rear of the vehicle. Failures cluster at 30,000-80,000 miles.",
      dtcCodes: ['P0087', 'P0191', 'P0230'],
    },
  },
  {
    id: 'alfa-romeo-stelvio-stall',
    note: 'Same fuel pump issue as Giulia — NHTSA recall 25V-667 (Stellantis 93C). Primary documented year range is the 2018-2021 production window; tightening.',
    fields: {
      years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
      title: 'Low-Pressure Fuel Pump Failure Causing Stall (Recall 25V-667)',
      description: "2018+ Stelvios can experience sudden engine stall or no-start due to a defective low-pressure fuel pump inside the fuel delivery module — same defect as the Giulia, same supplier, same NHTSA timeline. The pump's internal commutator wears prematurely and loses contact, cutting fuel supply at any speed. NHTSA recall 25V-667 (Stellantis campaign 93C) covers free replacement. Failures cluster at 30,000-80,000 miles; stalls reported at highway speed make this safety-critical until repaired.",
      dtcCodes: ['P0087', 'P0191', 'P0230'],
    },
  },
  {
    id: 'alfa-romeo-giulia-transfer-case-noise',
    note: 'Documented Q4 transfer case symptoms are jolting/slipping during acceleration, leaks, and 5th-gear resonance — NOT low-speed turning whine. Re-framing description to match real-world reports.',
    fields: {
      title: 'Q4 AWD Transfer Case Jolting and Resonance Rumble',
      description: "The Giulia Q4 AWD system can develop two related transfer case symptoms with age: a perceptible jolt or slip during light-throttle acceleration in 2nd-3rd gear (output-shaft clutch wear) and a resonant low-frequency rumble at highway speed around 4th-5th gear (worn output bearings). Both are exacerbated by infrequent transfer-case fluid changes. The original 'whining during low-speed turns' description was incorrect — that pattern matches differential wear, not the Q4 transfer case.",
      dtcCodes: [],
    },
  },
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Genesis + Alfa Romeo Audit Fixes (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`━━━ Archive ${ARCHIVE_IDS.length} issues ━━━`);
  for (const id of ARCHIVE_IDS) {
    const r = (await pool.query(`SELECT id, make, title, status FROM "KnownIssue" WHERE id = $1`, [id])).rows[0];
    if (!r) { console.log(`  ✗ ${id} — not found`); continue; }
    if (r.status === 'archived') { console.log(`  ~ ${id} — already archived`); continue; }
    console.log(`  ${APPLY ? '✓' : '·'} [${r.make}] ${id}`);
    if (APPLY) {
      await pool.query(`UPDATE "KnownIssue" SET status = 'archived', "updatedAt" = NOW() WHERE id = $1`, [id]);
    }
  }

  console.log(`\n━━━ Update ${UPDATES.length} issues ━━━`);
  const colMap = {
    title: 'title',
    description: 'description',
    solution: 'solution',
    severity: 'severity',
    years: 'years',
    trims: 'trims',
    dtcCodes: '"dtcCodes"',
    estimatedCostLow: '"estimatedCostLow"',
    estimatedCostHigh: '"estimatedCostHigh"',
    typicalMileageLow: '"typicalMileageLow"',
    typicalMileageHigh: '"typicalMileageHigh"',
  };
  for (const u of UPDATES) {
    const before = (await pool.query(
      `SELECT id, make, title, years, severity, "dtcCodes" FROM "KnownIssue" WHERE id = $1`,
      [u.id],
    )).rows[0];
    if (!before) { console.log(`  ✗ ${u.id} — not found`); continue; }
    console.log(`\n  [${before.make}] ${u.id}`);
    console.log(`    note: ${u.note}`);
    for (const [k, v] of Object.entries(u.fields)) {
      const oldVal = before[k] === undefined ? 'undefined' : JSON.stringify(before[k]);
      const newVal = JSON.stringify(v);
      console.log(`    ${k}:`);
      console.log(`      - ${oldVal.slice(0, 100)}${oldVal.length > 100 ? '...' : ''}`);
      console.log(`      + ${newVal.slice(0, 100)}${newVal.length > 100 ? '...' : ''}`);
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
      console.log(`    ✓ applied`);
    }
  }

  await pool.end();
  console.log(`\n${APPLY ? 'Done.' : '(dry-run — re-run with --apply to write)'}`);
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
