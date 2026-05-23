#!/usr/bin/env node
/**
 * Apply the May 22 BMW audit findings (Phase 1: archives only).
 *
 * Source: audit-bmw-1779438260052.json (Opus 4.7 + web_search, 355-issue
 * audit). Final tally: 17.2% verified, 45.6% minor, 25.9% major, 3.1%
 * fabricated, 8.2% errors.
 *
 * Phase 1 archives 11 fabricated + 15 wrong-vehicle/wrong-engine majors.
 * 77 remaining majors are fix-in-place candidates (overwhelmingly the
 * same mass-applied-EGR-DTC pattern) deferred to Phase 2 along with
 * the 162 minors.
 *
 * Notable BMW-specific hallucination patterns:
 *   - Z8 phantoms: 2 entries claiming "neon backlighting" in the
 *     instrument cluster. Neon lighting is on the Z8 TAILLIGHTS, not
 *     the cluster (which uses incandescent bulbs).
 *   - M4 CS cluster: 3 entries on the 2024 M4 CS with no documented
 *     evidence (rear diff mount, VDC suspension, CFRP roof creak).
 *   - i7 confusion: 48V MHEV claimed on a fully-electric vehicle (the
 *     48V MHEV is on the ICE 7 Series 740i/760i, not the i7).
 *   - Track-use cracking copied from older chassis: F87 M2 entries
 *     extrapolating the famous E46 subframe issue; G80 M3 CS entries
 *     copying F8x diff mount patterns.
 *   - Nikasil V12 misattribution: Nikasil bore wear was the M60 V8
 *     (840i), NOT the M70/M73 V12 (which used Alusil from the start).
 *   - Wrong engine for the trim: 760i is N74 V12 (not N63/S63);
 *     X2 has MECHANICAL belt-driven water pump (not electric).
 *   - Wrong transmission: ZF 6HP mechatronic sleeve issue copied to
 *     ZF 8HP applications (X5 E70, 6-Series F12) where it doesn't apply.
 *
 * Usage:
 *   node scripts/fix-bmw-archives.js              # dry-run
 *   node scripts/fix-bmw-archives.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

const ARCHIVE_IDS = [
  // ═══════════════════════════════════════════════════════════
  // FABRICATED (11) — Opus 4.7 + web_search found no real-world evidence
  // ═══════════════════════════════════════════════════════════

  // ── Z8 neon cluster phantoms (2) ──
  'bmw-z8-neon-gauge-cluster-2000',     // Z8 cluster uses incandescent; neon is in taillights
  'bmw-z8-neon-gauge-failure-2000',     // Same — duplicate entry of the same phantom

  // ── M4 CS rare-niche fabrications (3) ──
  'bmw-m3-cs-rear-diff-mount-2024',     // No documented G80 M3 CS diff mount tearing pattern
  'bmw-m4-cs-adaptive-suspension-fault-2024', // No documented M4 CS VDC fault pattern
  'bmw-m4-cs-carbon-roof-creak-2024',   // No CFRP roof creak pattern; M4 CS has no sunroof

  // ── i7 EV confusion (2) ──
  'bmw-i7-48v-mild-hybrid-faults-2025', // i7 is fully EV, no 48V MHEV — that's on ICE 7-Series
  'bmw-i7-air-suspension-compressor-2025', // No documented G70 i7 compressor pattern (too new)

  // ── Track-use cracking copied from older chassis (2) ──
  'bmw-m2-rear-subframe-2016',          // F87 M2 doesn't have E46 subframe issue
  'bmw-m2-s58-oil-starvation-2023',     // G87 M2 inherits M Division oiling system designed for 1.2g

  // ── Other cross-platform bleed (2) ──
  'bmw-m8-driveshaft-center-bearing-2020', // CSB wear is older E36/E39/E46/E90 issue
  'bmw-8-series-nikasil-bore-1991',     // Nikasil affected M60 V8 (840i), not M70/M73 V12

  // ═══════════════════════════════════════════════════════════
  // MAJORS THAT CAN'T BE SALVAGED (15) — wrong-vehicle, wrong-engine,
  // or fundamental misattribution. Fix-in-place candidates deferred
  // to Phase 2.
  // ═══════════════════════════════════════════════════════════

  // ── Wrong engine for the trim (3) ──
  'bmw-7-series-n63-oil-consumption-2009', // 760i is N74 V12, not N63/S63
  'bmw-x2-water-pump-2018',                // X2 B48 has MECHANICAL belt-driven water pump, not electric
  'bmw-m2-crank-hub-bolt-2016',            // Base 2016-2018 M2 uses N55; only M2 Competition has S55

  // ── Wrong transmission / cross-generation confusion (3) ──
  'bmw-m5-smg-pump-failure-2006',          // Labeled F10 M5 DCT but issue is E60 M5 SMG (different transmission)
  'bmw-6-series-transmission-mechatronics-2012', // ZF 6HP sleeve issue copied to ZF 8HP (F12 has 8HP)
  'bmw-x5-zf-8hp-mechatronic-2007',        // Same 6HP→8HP confusion; 2007-2010 E70 used 6HP not 8HP

  // ── Wrong vehicle for the issue (4) ──
  'bmw-2-series-xdrive-transfer-case-2014', // Not a documented 2-Series pattern (X3/X5/X6 with ATC)
  'bmw-x6m-transfer-case-actuator-2015',   // X6 M uses M-specific xDrive, not the non-M actuator pattern
  'bmw-z4-e85-rear-subframe-cracking-2003', // E46 subframe issue, Z4 uses different rear architecture
  'bmw-z8-steering-column-2000',           // Lower bearing wear is Z3/Z4/E46, not Z8 (per Z8 forum consensus)

  // ── Fundamental misattribution / cross-pattern bleed (5) ──
  'bmw-5-series-coolant-pipe-leak-2011',   // N63 doesn't have the N62 "valley" coolant transfer pipe
  'bmw-i3-brake-actuator-2014',            // Copies language from 2023-2025 IB recall that doesn't apply to i3
  'bmw-z4-e89-roof-drain-clog-2009',       // Real water-intrusion cause on E89 is tail light gutters, not roof drains
  'bmw-z8-steering-column-flex-2000',      // No evidence of "aluminum space frame steering column flex" pattern
  'bmw-xm-s68-oil-consumption-2023',       // Audit notes mentions appear only in "low-quality AI-generated content"
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  BMW Audit Archives — Phase 1 (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log(`  Target: ${ARCHIVE_IDS.length} issues`);
  console.log('═══════════════════════════════════════════════════════════\n');

  let archived = 0, alreadyArchived = 0, notFound = 0, failed = 0;
  const byCategory = {};

  for (const id of ARCHIVE_IDS) {
    const r = (await pool.query(
      `SELECT id, model, title, status FROM "KnownIssue" WHERE id = $1`,
      [id],
    )).rows[0];
    if (!r) { console.log(`  ✗ ${id} — not found`); notFound++; continue; }
    if (r.status === 'archived') { console.log(`  ~ ${id} — already archived`); alreadyArchived++; continue; }
    byCategory[r.model] = (byCategory[r.model] || 0) + 1;
    console.log(`  ${APPLY ? '✓' : '·'} [${r.model.padEnd(20)}] ${id}`);
    console.log(`      "${r.title.slice(0, 80)}"`);
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
  console.log('  By model:');
  for (const [model, c] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${model.padEnd(20)} ${c}`);
  }
  console.log('═══════════════════════════════════════════════════════════');

  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
