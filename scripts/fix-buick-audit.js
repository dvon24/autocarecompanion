#!/usr/bin/env node
/**
 * Apply audit findings to the 11 newly-added Buick pending_review entries.
 *
 * Audit via WebSearch (2026-05-23).
 * 10 verified clean, 1 needed a major correction — the Enclave "power
 * steering hose fire recall" doesn't exist as I framed it. Reality is
 * Special Coverage Adjustment 14329 (loss of PS assist, not fire) —
 * different scope entirely. Reframing rather than archiving since the
 * underlying issue is real and well-documented.
 *
 * Verdicts:
 *   ✓ buick-3800-lower-intake-gasket-park-avenue
 *   ✓ buick-3800-lower-intake-gasket-lesabre
 *   ✓ buick-lacrosse-3.6l-timing-chain
 *   ✓ buick-enclave-timing-chain-2008-2012
 *   ~ buick-enclave-power-steering-recall  — RESCOPE: not a fire recall; is Special Coverage 14329 for loss of PS assist
 *   ✓ buick-regal-2.0t-timing-chain-ltg
 *   ✓ buick-regal-aisin-af40-transmission
 *   ✓ buick-lucerne-northstar-head-bolt
 *   ✓ buick-encore-1.4-turbo-timing-chain
 *   ✓ buick-encore-gx-1.2-1.3-turbo-shudder
 *   ✓ buick-cascada-1.6t-timing-chain
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
    id: 'buick-enclave-power-steering-recall',
    note: 'I cited NHTSA 14V-355 for a power-steering-hose fire recall — but 14V-355 is actually the GM Impala ignition-switch recall, not a PS hose action. There is NO NHTSA fire recall for PS hose on these GM crossovers. The actual GM action is Special Coverage Adjustment 14329 (10 yr / 150,000 mi extension) covering POWER STEERING PUMP WEAR / loss of PS assist on 2007-2011 Acadia, 2008-2011 Enclave, 2009-2011 Traverse, 2007-2010 Outlook. Reframing entirely — not a recall, not a fire, but is a real and well-documented PS issue.',
    fields: {
      years: range(2008, 2011),
      title: 'Enclave Power Steering Assist Loss — Special Coverage Adjustment 14329',
      description: 'GM Special Coverage Adjustment 14329 — extending warranty to 10 years / 150,000 miles — covers 2008-2011 Buick Enclave, 2007-2011 GMC Acadia, 2009-2011 Chevrolet Traverse, and 2007-2010 Saturn Outlook for power-steering pump wear that causes intermittent drop in hydraulic pressure and loss of steering assist. This is a special coverage program, NOT a recall — owners must initiate the claim. Symptoms: heavy steering at low speed, especially when engine is hot.',
      solution: 'Confirm Special Coverage 14329 eligibility at any GM/Buick dealer with your VIN. If still within 10 years and 150,000 miles, remedy is free: dealer flushes power-steering system, replaces the PS pump, and installs a new steering-gear valve housing. If out of the coverage window, expect $700-$1,400 for the same job at an independent.',
      severity: 'high',
      estimatedCostHigh: 1400,
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
  console.log(`  Apply Buick Audit Fixes (${APPLY ? 'APPLY' : 'dry-run'})`);
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
  console.log(`\nNext (after --apply): node scripts/publish-verified-issues.js --all-make Buick --apply`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
