#!/usr/bin/env node
/**
 * Flip pending_review issues to published once verified.
 *
 * Two modes:
 *   --ids id1,id2,id3       Flip specific IDs (typed comma-separated)
 *   --ids-file path.json    Read array of IDs from a JSON file
 *   --all-make MAKE         Flip all pending_review issues for one make
 *                           (use with care — implies the whole batch
 *                            has been verified)
 *
 * Always dry-runs by default. Add --apply to actually update.
 *
 * Workflow:
 *   1. Add new entries via insertPendingIssue() (status=pending_review)
 *   2. Audit them via scripts/audit-pending-issues.js (WebSearch + verifier)
 *   3. For verified entries, run this script with --ids or --ids-file
 *   4. For entries needing fixes, edit them first (script-based or directly),
 *      THEN flip to published
 *   5. For fabricated entries, archive instead (status='archived')
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');
const args = process.argv.slice(2);

function getArg(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}

async function main() {
  let ids = [];

  const idsArg = getArg('--ids');
  const idsFile = getArg('--ids-file');
  const allMake = getArg('--all-make');

  if (idsArg) {
    ids = idsArg.split(',').map(s => s.trim()).filter(Boolean);
  } else if (idsFile) {
    ids = JSON.parse(fs.readFileSync(idsFile, 'utf8'));
    if (!Array.isArray(ids)) throw new Error('--ids-file must contain a JSON array of IDs');
  } else if (allMake) {
    const r = (await pool.query(
      `SELECT id FROM "KnownIssue" WHERE make = $1 AND status = 'pending_review'`,
      [allMake],
    )).rows;
    ids = r.map(x => x.id);
    console.log(`Found ${ids.length} pending_review issues for make="${allMake}"\n`);
  } else {
    console.error('Required: --ids id1,id2 OR --ids-file path.json OR --all-make MAKE');
    process.exit(1);
  }

  if (ids.length === 0) {
    console.log('No IDs to flip.');
    await pool.end();
    return;
  }

  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Publish Verified Issues (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log(`  Target: ${ids.length} IDs`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  let flipped = 0, skipped = 0, notFound = 0;

  for (const id of ids) {
    const r = (await pool.query(`SELECT id, status FROM "KnownIssue" WHERE id = $1`, [id])).rows[0];
    if (!r) {
      console.log(`  ✗ ${id} — not found`);
      notFound++;
      continue;
    }
    if (r.status === 'published') {
      console.log(`  ~ ${id} — already published`);
      skipped++;
      continue;
    }
    if (r.status !== 'pending_review') {
      console.log(`  ! ${id} — status is "${r.status}" (expected pending_review); skipping`);
      skipped++;
      continue;
    }
    console.log(`  ${APPLY ? '✓' : '·'} ${id} — pending_review → published`);
    if (APPLY) {
      await pool.query(
        `UPDATE "KnownIssue" SET status='published', "updatedAt" = NOW() WHERE id = $1`,
        [id],
      );
      flipped++;
    } else {
      flipped++;
    }
  }

  console.log(`\n${APPLY ? 'Flipped' : 'Would flip'}: ${flipped}, Skipped: ${skipped}, Not found: ${notFound}`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
