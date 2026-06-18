#!/usr/bin/env node
/**
 * Persist enriched DTC descriptions/common-causes from a dtc-description-enrich
 * workflow output. ZERO AI calls — pure pg UPDATEs to DTCCode.
 *
 * Safety: only overwrites when the new description is non-trivial (>= 80 chars)
 * AND longer than the existing one (the whole point is to expand thin entries),
 * and only replaces commonCauses when the new list is at least as long.
 *
 * Usage: node scripts/_persist-dtc-enrich.js <workflow-output-path> [--dry-run]
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');

const OUTPUT_PATH = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
if (!OUTPUT_PATH || !fs.existsSync(OUTPUT_PATH)) {
  console.error('Usage: node scripts/_persist-dtc-enrich.js <workflow-output-path> [--dry-run]');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
pool.on('error', () => {});

async function main() {
  const payload = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
  const enriched = payload?.result?.enriched || [];
  const stats = payload?.result?.stats || {};
  console.log(`Workflow stats: ${JSON.stringify(stats)}`);
  console.log(`Enriched entries to persist: ${enriched.length}${dryRun ? ' (dry-run)' : ''}\n`);

  let updated = 0, skipped = 0, missing = 0;

  for (const e of enriched) {
    if (!e?.code) continue;
    const code = String(e.code).toUpperCase();
    const newDesc = String(e.description || '').trim();
    const newCauses = Array.isArray(e.commonCauses) ? e.commonCauses.map((c) => String(c).trim()).filter(Boolean) : [];

    const cur = await pool.query(`SELECT description, "commonCauses" FROM "DTCCode" WHERE code = $1`, [code]);
    if (cur.rows.length === 0) { missing++; continue; }
    const curDesc = cur.rows[0].description || '';
    const curCauses = Array.isArray(cur.rows[0].commonCauses) ? cur.rows[0].commonCauses : [];

    const takeDesc = newDesc.length >= 80 && newDesc.length > curDesc.length;
    const takeCauses = newCauses.length >= curCauses.length && newCauses.length >= 3;
    if (!takeDesc && !takeCauses) { skipped++; continue; }

    const finalDesc = takeDesc ? newDesc : curDesc;
    const finalCauses = takeCauses ? newCauses : curCauses;
    if (!dryRun) {
      await pool.query(
        `UPDATE "DTCCode" SET description = $2, "commonCauses" = $3, "updatedAt" = NOW() WHERE code = $1`,
        [code, finalDesc, finalCauses],
      );
    }
    updated++;
    if (updated <= 8) console.log(`✓ ${code}: desc ${curDesc.length}->${finalDesc.length} chars, causes ${curCauses.length}->${finalCauses.length}`);
  }

  console.log(`\n━━━ DTC enrich ${dryRun ? 'dry-run' : 'persist'} complete ━━━`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (not richer): ${skipped}`);
  console.log(`  Code not in DTCCode table: ${missing}`);
  console.log('\nLive pages re-render within 1h (ISR revalidate=3600), or on next deploy.');

  await pool.end();
}

main().catch((err) => { console.error('FAIL:', err.message); pool.end(); process.exit(1); });
