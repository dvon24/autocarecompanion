#!/usr/bin/env node
/**
 * Apply audit findings to the 11 newly-added Saab pending_review entries.
 *
 * Audit via WebSearch (2026-05-23).
 * 10 verified clean, 1 needed an NHTSA recall-number correction.
 *
 * Verdicts:
 *   ✓ saab-9-3-direct-ignition-cassette
 *   ✓ saab-9-5-direct-ignition-cassette
 *   ✓ saab-9-5-b235-oil-sludge             (class action + 8-year warranty extension in 2005 confirmed)
 *   ✓ saab-9-3-sentronic-af33-failure      (AF33-5 / AW55-50SN confirmed)
 *   ✓ saab-9-5-sid-pixel-failure
 *   ✓ saab-9-3-sunroof-drain-clog
 *   ✓ saab-9-3-turbo-failure-b207
 *   ✓ saab-9-2x-head-gasket-2.5
 *   ~ saab-9-7x-fuel-level-sensor-recall   — wrong recall # (12V-413); real is 12V-406 (initial) + 14V-404 (expansion). Title was wrong too ("fuel level sensor" was a copy-paste slip; the actual issue IS the window switch fire).
 *   ✓ saab-900-classic-windshield-frame-rust
 *   ✓ saab-9-3-second-gen-control-arm-bushings
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
    id: 'saab-9-7x-fuel-level-sensor-recall',
    note: 'Two issues: (1) the ID slug says "fuel-level-sensor" but the actual recall I described and verified is the driver-door master power-window-switch fire — leaving the ID alone to avoid breaking inbound links if any, but fixing title/description. (2) The recall number 12V-413 was wrong. Real recall numbers are 12V-406 (initial 2012 recall on Saab 9-7X et al.) and 14V-404 (2014 follow-up expansion). The issue (fluid entry → corrosion → short → fire) is correct and well-documented.',
    fields: {
      years: range(2005, 2007),
      title: '9-7X Driver-Door Master Power Window Switch Fire Recall (NHTSA 12V-406 + 14V-404)',
      description: 'NHTSA recalls 12V-406 (2012 initial) and 14V-404 (2014 expansion) cover certain 2005-2007 Saab 9-7X (and shared GM siblings Chevy TrailBlazer, GMC Envoy, Buick Rainier, Isuzu Ascender — all GMT360 platform) for a driver-side master power-window switch where fluid entry can cause corrosion in the switch module, leading to a short, overheating, melted components, and fire. Multiple in-service fires reported, including some while the vehicle was parked.',
      solution: 'Check VIN at NHTSA recall lookup (12V-406 / 14V-404). Free dealer remedy: inspect part number on the door module and install a new switch module if affected. GM advised parking outside until the remedy is performed. If you smell burning plastic from the driver door, do not operate the window — get the recall fix scheduled immediately.',
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
  console.log(`  Apply Saab Audit Fixes (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log(`  Target: ${UPDATES.length} entries (out of 11 audited)`);
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
  console.log(`\nNext (after --apply): node scripts/publish-verified-issues.js --all-make Saab --apply`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
