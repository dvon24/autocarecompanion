#!/usr/bin/env node
/**
 * Apply audit findings to the 12 newly-added Saturn pending_review entries.
 *
 * Audit via WebSearch (2026-05-23).
 * 11 verified clean, 1 needed major rescope — same issue as the Buick
 * Enclave PS-hose claim: I cited a fire recall (14V-355) that doesn't
 * cover this scenario. Reality is Special Coverage Adjustment 14329
 * (loss of PS assist on 2007-2010 Outlook + sister vehicles), not a
 * fire-risk recall. Reframing without losing the valid PS-assist info.
 *
 * Verdicts:
 *   ✓ saturn-s-series-valve-cover-leak-1.9
 *   ✓ saturn-s-series-oil-consumption-dohc
 *   ✓ saturn-sc-coupe-suicide-door-sag
 *   ✓ saturn-vue-vti-cvt-failure                  (5yr/75k extended warranty confirmed)
 *   ✓ saturn-vue-3.5l-honda-timing-belt
 *   ✓ saturn-ion-eps-failure-recall               (14V-153 confirmed)
 *   ✓ saturn-ion-ignition-switch-recall           (14V-047 confirmed, includes Ion via 2014 expansion)
 *   ✓ saturn-aura-3.6l-timing-chain
 *   ~ saturn-outlook-power-steering-recall        — RESCOPE: not 14V-355 fire recall; is Special Coverage 14329 PS-assist loss
 *   ✓ saturn-sky-trunk-leak
 *   ✓ saturn-sky-ignition-switch-recall           (14V-047 confirmed)
 *   ✓ saturn-astra-1.8-timing-chain
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
    id: 'saturn-outlook-power-steering-recall',
    note: 'I cited NHTSA 14V-355 for a fire recall — but 14V-355 is actually the GM Impala ignition-switch recall, not a PS hose action. There is no NHTSA fire recall for PS hose on the GM crossovers. The actual GM action covering 2007-2010 Outlook (and sister vehicles 2007-2011 Acadia, 2008-2011 Enclave, 2009-2011 Traverse) is Special Coverage Adjustment 14329 — 10yr/150,000mi extension for POWER STEERING PUMP WEAR causing loss of PS assist. Different scope entirely. Reframing rather than archiving.',
    fields: {
      years: range(2007, 2010),
      title: 'Outlook Power Steering Assist Loss — GM Special Coverage 14329',
      description: 'GM Special Coverage Adjustment 14329 extends warranty to 10 years / 150,000 miles for power-steering pump wear on 2007-2010 Saturn Outlook, 2007-2011 GMC Acadia, 2008-2011 Buick Enclave, 2009-2011 Chevrolet Traverse. The pump wears internally, causing intermittent drop in hydraulic pressure and loss of steering assist — heavy steering at low speed, particularly when the engine is hot. This is a special coverage program, NOT a recall — owners must initiate the claim. (Note: a fire-risk recall on this PS hose does NOT exist; only the PS-assist-loss special coverage.)',
      solution: 'Confirm Special Coverage 14329 eligibility at any GM dealer with your VIN. If still within 10 years and 150,000 miles, remedy is free: dealer flushes power-steering system, replaces the PS pump, installs a new steering-gear valve housing. If out of the coverage window, expect $700-$1,400 for the same job at an independent.',
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
  console.log(`  Apply Saturn Audit Fixes (${APPLY ? 'APPLY' : 'dry-run'})`);
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
  console.log(`\nNext (after --apply): node scripts/publish-verified-issues.js --all-make Saturn --apply`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
