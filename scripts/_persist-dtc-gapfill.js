#!/usr/bin/env node
/**
 * Insert generated reference rows for the DTC codes that issues cite but
 * lacked a DTCCode row (from the dtc-gapfill-reference workflow). Once a
 * row exists, /known-issues/dtc/[code] renders (the code is already linked
 * to >=1 published issue). ZERO AI calls — pure pg inserts.
 *
 * Idempotent: ON CONFLICT (code) DO NOTHING (never overwrites an existing
 * reference row). Reports a per-confidence breakdown so low-confidence
 * manufacturer-specific codes can be spot-checked.
 *
 * Usage: node scripts/_persist-dtc-gapfill.js <workflow-output-path> [--dry-run]
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');

const OUTPUT_PATH = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
if (!OUTPUT_PATH || !fs.existsSync(OUTPUT_PATH)) {
  console.error('Usage: node scripts/_persist-dtc-gapfill.js <workflow-output-path> [--dry-run]');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
pool.on('error', () => {});

const VALID_SYSTEM = new Set(['Powertrain', 'Body', 'Chassis', 'Network']);
const VALID_SEV = new Set(['critical', 'high', 'medium', 'low']);

async function main() {
  const payload = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
  const generated = payload?.result?.generated || [];
  const stats = payload?.result?.stats || {};
  console.log(`Workflow stats: ${JSON.stringify(stats)}`);
  console.log(`Generated entries: ${generated.length}${dryRun ? ' (dry-run)' : ''}\n`);

  let inserted = 0, skippedExist = 0, skippedBad = 0;
  const conf = { high: 0, medium: 0, low: 0 };

  for (const g of generated) {
    const code = String(g?.code || '').toUpperCase().trim();
    const name = String(g?.name || '').trim();
    const desc = String(g?.description || '').trim();
    const system = VALID_SYSTEM.has(g?.system) ? g.system : 'Powertrain';
    const severity = VALID_SEV.has(g?.severity) ? g.severity : 'medium';
    const causes = Array.isArray(g?.commonCauses) ? g.commonCauses.map((c) => String(c).trim()).filter(Boolean) : [];
    if (!/^[PBCU][0-9A-F]{4}$/.test(code) || name.length < 3 || desc.length < 40) { skippedBad++; continue; }

    if (!dryRun) {
      const r = await pool.query(
        `INSERT INTO "DTCCode" (code, name, system, description, "commonCauses", severity, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (code) DO NOTHING`,
        [code, name, system, desc, causes, severity],
      );
      if (r.rowCount === 0) { skippedExist++; continue; }
    }
    inserted++;
    conf[g.confidence] = (conf[g.confidence] || 0) + 1;
    if (inserted <= 6) console.log(`✓ ${code} [${severity}/${g.confidence}]: ${name}`);
  }

  console.log(`\n━━━ DTC gap-fill ${dryRun ? 'dry-run' : 'insert'} complete ━━━`);
  console.log(`  Inserted: ${inserted}  (confidence — high:${conf.high} medium:${conf.medium} low:${conf.low})`);
  console.log(`  Skipped (already existed): ${skippedExist}`);
  console.log(`  Skipped (failed validation): ${skippedBad}`);
  console.log(`\nThese codes already link to published issues, so their pages render now`);
  console.log(`(dynamicParams) and join the sitemap on the next build. Low-confidence`);
  console.log(`codes are conservatively worded — spot-check by querying confidence later.`);

  await pool.end();
}

main().catch((err) => { console.error('FAIL:', err.message); pool.end(); process.exit(1); });
