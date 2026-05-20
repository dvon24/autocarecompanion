#!/usr/bin/env node
/**
 * Apply the May 20 Audi audit findings (Phase 1: archives only).
 *
 * Source: audit-audi-1779208611242.json (Opus 4.7 + web_search, 306 issues).
 *
 * Phase 1 archives 12 fabricated + ~28 wrong-vehicle/wrong-market/wrong-engine
 * majors where the row can't be salvaged without becoming a fundamentally
 * different entry. Fix-in-place candidates (139 minors + remaining ~33
 * recoverable majors) are deferred to Phase 2.
 *
 * Notable Audi-specific hallucination patterns:
 *   - SQ5/SQ7/SQ8 "sport differential" — the SQ-variants don't have the
 *     optional torque-vectoring rear axle; that's an S4/S5/RS5/RS4 option.
 *   - A4 allroad "air suspension" — A4 allroad has NEVER had air suspension
 *     in any market; the original C5 A6 allroad (2001-2005) did, hence the
 *     cross-model bleed.
 *   - Wrong recall scope on shared recalls (e.g., 90VC Virtual Cockpit on
 *     e-tron / Q5 Sportback when neither is listed; 21H7 turbo oil strainer
 *     on SQ7/SQ8 when it's A8/S6/S7/S8/RS7 only).
 *   - US-market vehicles vs European-only models (RS4 B9 wasn't sold in
 *     the US — that's the RS5 — but we had RS4 entries with US pricing).
 *
 * Usage:
 *   node scripts/fix-audi-archives.js              # dry-run
 *   node scripts/fix-audi-archives.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

const ARCHIVE_IDS = [
  // ═══════════════════════════════════════════════════════════
  // FABRICATED (12) — Opus 4.7 + web_search found no real-world
  // evidence; many cases show classic cross-platform bleed.
  // ═══════════════════════════════════════════════════════════

  // ── Sport differential phantom on SQ-variants (3) ──
  'audi-sq5-sport-diff-2018',          // SQ5 has brake-based vectoring, no sport diff option
  'audi-sq8-sport-diff-2020',          // No documented sport-diff pattern on SQ8
  'audi-rs-etron-gt-hv-coolant-2022',  // HV coolant leak is e-tron SUV motor seal issue, not GT

  // ── A4 allroad "air suspension" — fundamental wrong attribution (2) ──
  'audi-a4-allroad-air-suspension-2013',   // A4 allroad uses coil springs in all markets
  'audi-a4-allroad-air-spring-rear-2013',  // Same — confused with C5 A6 allroad

  // ── Wrong engine / wrong transmission (3) ──
  'audi-rs4-turbo-coolant-2018',       // Real EA839 issue is water pump, not turbo coolant lines
  'audi-s7-torque-converter-2012',     // C7 S7 uses 7-speed DSG, not ZF 8HP
  'audi-sq5-mechatronic-2014',         // SQ5 uses ZF 8HP, not DL501 S-Tronic

  // ── Wrong recall scope (4) ──
  'audi-a8-front-brake-hose-chafing-2004',     // 47UP recall is e-tron GT, not D3 A8
  'audi-a8-fuel-pump-control-module-2004',     // FPCM recall is 2.0T FSI/TSI, not D3 A8 V8/W12
  'audi-sq7-turbo-oil-filter-2020',            // Recall 21H7 doesn't cover SQ7; new strainer from factory
  'audi-sq8-turbo-oil-filter-2020',            // Recall 21H7 doesn't cover SQ8; updated DWNB 4.0T

  // ═══════════════════════════════════════════════════════════
  // MAJORS THAT CAN'T BE SALVAGED (28) — wrong-vehicle, wrong-market,
  // wrong-engine, or fundamental misattribution where a rewrite would
  // amount to a new entry. Fix-in-place candidates left for Phase 2.
  // ═══════════════════════════════════════════════════════════

  // ── Wrong US-market sales (RS4 not sold in US 2018+, C7 RS6 not in US, etc.) (5) ──
  'audi-rs4-carbon-buildup-2018',      // RS4 B9 not sold in US 2018-2023; equivalent is RS5
  'audi-rs4-sport-diff-2018',          // RS4 B9 not sold in US; cost also way understated
  'audi-rs5-sport-diff-2018',          // B9 RS5 typically doesn't come with sport diff
  'audi-rs6-rs7-turbo-oil-strainer-2013', // C7 RS6 not sold in US; recall is RS7-only
  'audi-rs5-29t-carbon-2018',          // 2.9T carbon buildup not widely documented

  // ── Wrong transmission/engine for US trim (4) ──
  'audi-q5-mechatronic-2009',          // US 8R Q5 uses ZF 8HP, not DL501
  'audi-a5-sportback-mechatronic-2018', // US B9 A5 Sportback uses ZF 8HP, not DSG
  'audi-a6-s-tronic-dsg-issues-2012',  // US A6 C7 uses ZF 8HP, not 7-speed DSG
  'audi-a7-dsg-transmission-2012',     // US A7 C7 uses ZF 8HP, not 7-speed DSG

  // ── Wrong recall scope on shared-platform recalls (3) ──
  'audi-etron-virtual-cockpit-2019',                // 90VC recall doesn't include e-tron
  'audi-q5-sportback-virtual-cockpit-glitch-2021',  // 90VC recall doesn't include Q5 Sportback
  'audi-sq7-coolant-line-leak-2020',                // Service Campaign 21F2 doesn't cover SQ7

  // ── Wrong engine generation / cross-generation conflation (6) ──
  'audi-q7-supercharger-2011',         // Year range conflates Mk I (2007-2015) and Mk II (2017+)
  'audi-q5-sportback-pcv-valve-2021',  // PCV diaphragm is older EA888 Gen 1/2; year range spans two generations
  'audi-a4-allroad-oil-consumption-2013', // Oil consumption is Gen 2 (CAEB) not Gen 3 used in 2013+ allroad
  'audi-a6-allroad-turbo-wastegate-2020', // Vacuum actuator described as electric; wastegate rattle is EA888, not EA839
  'audi-rs6-turbo-coolant-2020',       // Turbo coolant lines is C7-era 4.0T; C8 RS6 issues are water pump / 48V BSG
  'audi-sq7-turbo-coolant-2020',       // Primary SQ7 cooling issue is water pump, not turbo coolant lines

  // ── Fundamental misattribution / wrong-cause (4) ──
  'audi-tt-electric-waterpump-2008',   // Main TT coolant pump is mechanical belt-driven, not electric
  'audi-a4-avant-tailgate-wiring-2009', // Real issue is rear wiper motor water ingress, not harness chafing
  'audi-100-coolant-leak-1992',        // Plastic flange is 1.8T; 1992 100 2.8 V6 uses metal pipes
  'audi-s7-oil-consumption-4.0t-2012', // TSB is for 2.0T EA888, not 4.0T V8

  // ── No documented evidence (cluster of "sport diff" / "no pattern") (3) ──
  'audi-sq7-sport-diff-2020',          // No documented SQ7 sport-diff failure pattern
  'audi-a6-allroad-adaptive-damper-2020', // No C8 evidence; extrapolated from C5/C6/C7
  'audi-s5-supercharger-clutch-2010',  // CREC 3.0T never installed in NA S4/S5

  // ── Wrong years entirely (3) ──
  'audi-a6-oil-consumption-2005',      // 2.0 TFSI not in US A6 until 2012 C7
  'audi-a6-allroad-air-spring-leak-2020', // C8 too young for bladder deterioration; DTCs unverified
  'audi-etron-gt-dc-charging-throttle-2022', // Describes normal EV charging behavior as a defect
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Audi Audit Archives — Phase 1 (${APPLY ? 'APPLY' : 'dry-run'})`);
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
