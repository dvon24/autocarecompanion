#!/usr/bin/env node
/**
 * Apply the May 18 medium-niche makes audit findings (Phase 1: archives only).
 *
 * Covers 7 makes: MINI, Lexus, Infiniti, Land Rover, Jaguar, Porsche, RAM.
 *
 * Archives 52 issues total:
 *   - 31 likely-fabricated (Opus 4.7 + web_search found no real-world evidence)
 *   - 21 wrong-vehicle / wrong-engine majors where the underlying issue either
 *     doesn't exist on the stated vehicle, or the description so fundamentally
 *     misattributes the root cause that a rewrite would amount to a new entry.
 *     For "wrong years on a real issue" cases (e.g. Infiniti Q50 steer-by-wire
 *     year range too broad), we leave the row alone — those are fix-in-place
 *     candidates for the Phase 2 pass.
 *
 * Usage:
 *   node scripts/fix-medium-niche-archives.js              # dry-run
 *   node scripts/fix-medium-niche-archives.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

const ARCHIVE_IDS = [
  // ─── FABRICATED (31) — Opus 4.7 found no documented evidence ───
  // Infiniti (3)
  'infiniti-q50-cvt-judder',
  'infiniti-m-q70-air-suspension-compressor',
  'infiniti-qx60-fuel-smell-or-fuel-2022',
  // Jaguar (5)
  'jaguar-i-pace-touchscreen-delamination-2019',
  'jaguar-xk-nikasil-bore-wear-2007',
  'jaguar-f-type-exhaust-manifold-crack-v6-2014',
  'jaguar-xk-oem-tire-tread-separation-and-blowout-risk',
  'jaguar-xk-automatic-transmission-or-transfer-case-failure',
  // Land Rover (4)
  'land-rover-defender-engine-mount-vibration-2020',
  'land-rover-range-rover-velar-wading-sensor-2018',
  'land-rover-defender-door-check-strap-2020',
  'land-rover-discovery-sport-fuel-pump-ingenium-2020',
  // Lexus (9)
  'lexus-rc-dashboard-melt-2015',
  'lexus-nx200t-turbo-heat-soak-2015',
  'lexus-lc-exhaust-drone-2018',
  'lexus-rcf-differential-whine-2015',
  'lexus-is-battery-discharge-no-start-2023',
  'lexus-is-windshield-a-pillar-exterior-2023',
  'lexus-ls-aftermarket-fuel-filter-leakage-risk',
  'lexus-rx-panoramic-glass-roof-adhesivepanel-2023',
  'lexus-rx-vvt-i-oil-feed-hose-2004',
  // MINI (6)
  'mini-countryman-power-steering-2011',
  'mini-gp-sunroof-drainage-channel-blockage-causing-interior-water-ingress-gp2-gp3-equipped-models',
  'mini-gp-shift-linkage-wear-and-vague-gear-selection-gp2-manual-transmission',
  'mini-gp-dsg-aisin-6-speed-automatic-transmission-shudder-and-harsh-downshift-gp3',
  'mini-gp-rear-subframe-bushing-deterioration-causing-handling-imprecision-gp2-gp3',
  'mini-gp-differential-bearing-noise-and-limited-slip-differential-chatter-gp2-gp3',
  // Porsche (2)
  'porsche-macan-pdcc-leak-2015',
  'porsche-911-cylinder-scoring-992-2020',
  // RAM (2)
  'ram-promaster-city-brake-booster-2015',
  'ram-1500-esc-recall-2019',

  // ─── WRONG-VEHICLE MAJORS (21) — issue doesn't exist on this vehicle, or
  //      description so fundamentally misattributes the cause that the row
  //      can't be salvaged without becoming a new entry ───
  // Infiniti (5)
  'infiniti-q50-turbo-heat-shield-rattle',          // rattle on VR30DDTT is wastegate (turbo-failure precursor), not heat shields — wrong root cause
  'infiniti-q60-turbo-coolant-leak-vr30',           // described failure mode (plastic quick-connect fittings) is Ford 6.7 Powerstroke pattern, not VR30DDTT; Q60 production also ended after 2022
  'infiniti-qx50-rear-hatch-strut-weakness-2014',   // power liftgate described, but 2014-2018 QX50 has manual liftgate (power was 2019+ second-gen)
  'infiniti-qx60-ac-compressor-failure',            // no documented widespread A/C compressor pattern; no recalls or TSBs found
  'infiniti-q50-steer-by-wire-issues',              // we'd lose the real issue on 2014-2021 by tightening years; row's mixed-up trim attribution makes it cleaner to archive + re-research via v2 if needed
  // Jaguar (2)
  'jaguar-xj-timing-chain-tensioner-ajv8-2004',     // AJV8 cam-chain tensioner issue does not apply to the stated year/engine combo
  'jaguar-s-type-throttle-body-v6-2000',            // S-Type V6 stated production years don't match; described pattern not documented
  // Land Rover (6)
  'land-rover-range-rover-coolant-crossover-pipe-2006', // wrong engine — Range Rover coolant crossover pipe is the BMW M62 in the 1995-2002 P38; 2006+ moved to Jaguar V8
  'land-rover-range-rover-evoque-door-handle-2012',     // described keyless handle micro-switch fault doesn't apply — Evoque did not have that handle architecture in 2012
  'land-rover-all-terrain-response-module-2005',        // no NHTSA / TSB / forum evidence of a Terrain Response control module failure pattern
  'land-rover-range-rover-velar-water-ingress-2018',    // Velar does not have the described sunroof drain layout
  'land-rover-defender-wading-sensor-false-2020',       // no NHTSA / forum evidence of a wading-sensor false-positive pattern
  'landrover-rangeroversport-front-brake-squeal-judder-2023', // brake squeal misattribution + no evidence of the specific Sport-2023 pattern described
  // Lexus (2)
  'lexus-lx-timing-belt-tensioner-2000',            // LX 470 timing belt tensioner described, but LX 470 uses a chain, not a belt
  'lexus-is-automatic-transmission-ecu-failure-2001', // no evidence of an IS 2001 transmission ECU failure pattern
  // MINI (3)
  'mini-roadster-power-steering-pump-2012',         // Roadster uses electric power steering, not a hydraulic pump
  'mini-gp-dsc-abs-module-corrosion-causing-fault-codes-and-loss-of-stability-control-gp2', // no evidence of GP2-specific DSC/ABS module corrosion pattern
  'mini-coupe-high-pressure-fuel-pump-2012',        // no evidence of an HPFP pattern unique to the Coupe; the broader N14 HPFP issue is already covered on the regular hatch
  // Porsche (2)
  'porsche-718-cayman-coolant-leak-2017',           // no NHTSA evidence of the described 718 coolant-leak pattern
  'porsche-cayman-cylinder-scoring-981-2014',       // cylinder scoring is the M96/M97 issue (996/997, Boxster/Cayman 987.1); 981 generation uses MA122 with no documented scoring
  // RAM (1)
  'ram-2500-dash-screen-delamination-2019',         // no evidence of a dash-screen delamination pattern on RAM 2500; the screen-delam issue belongs to other GM/Ford trucks
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Medium-Niche Audit Archives (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log(`  Target: ${ARCHIVE_IDS.length} issues`);
  console.log('═══════════════════════════════════════════════════════════\n');

  let archived = 0, alreadyArchived = 0, notFound = 0, failed = 0;
  const byMake = {};

  for (const id of ARCHIVE_IDS) {
    const r = (await pool.query(`SELECT id, make, title, status FROM "KnownIssue" WHERE id = $1`, [id])).rows[0];
    if (!r) { console.log(`  ✗ ${id} — not found`); notFound++; continue; }
    if (r.status === 'archived') { console.log(`  ~ ${id} — already archived`); alreadyArchived++; continue; }
    byMake[r.make] = (byMake[r.make] || 0) + 1;
    console.log(`  ${APPLY ? '✓' : '·'} [${r.make}] ${id} — "${r.title.slice(0, 70)}"`);
    if (APPLY) {
      try {
        await pool.query(`UPDATE "KnownIssue" SET status = 'archived', "updatedAt" = NOW() WHERE id = $1`, [id]);
        archived++;
      } catch (err) {
        console.log(`    ✗ DB error: ${err.message.slice(0, 200)}`);
        failed++;
      }
    } else {
      archived++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Archived${APPLY ? '' : ' (would archive)'}: ${archived}`);
  console.log(`  Already archived:  ${alreadyArchived}`);
  console.log(`  Not found:         ${notFound}`);
  console.log(`  Failed:            ${failed}`);
  console.log('  By make:');
  for (const [make, c] of Object.entries(byMake).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${make.padEnd(15)} ${c}`);
  }
  console.log('═══════════════════════════════════════════════════════════');

  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
