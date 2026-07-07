#!/usr/bin/env node
/**
 * Persist a parts-seed research workflow's output into VehiclePartLookup.
 *
 * EXPLICITLY ZERO AI CALLS — pure pg writes. Reads the workflow .output
 * (payload.result.vehicles = [{year, make, model, trim, results:[{task,parts}]}]),
 * upserts one VehiclePartLookup row per (year,make,model,trim,task).
 *
 * TRUST HYGIENE (two writers into the same trust-anchor table — this seed and
 * the production resolver write-back — must not clobber each other):
 *   • Precedence guard: a lower-trust writer NEVER overwrites a higher-trust
 *     row. Source trust order (high→low): production-confirmed > pipeline >
 *     pipeline-freetext > workflow-seed > static > ai. This script writes
 *     'workflow-seed', so it fills empty/AI/static rows but leaves
 *     pipeline/production rows untouched.
 *   • Additive re-confirmation: when a write DOES land (new row, or overwriting
 *     an equal/lower-trust row), bump confirmationCount + lastConfirmedAt.
 *     "confirmed 14×, last week" vs "confirmed once, last October" is the
 *     difference between a row you trust and one you re-verify — costs nothing
 *     to record now, unrecoverable later. Columns are added idempotently and
 *     are pure persist-layer metadata (the app never selects them).
 *
 * Usage:  node scripts/_persist-parts-seed.js <workflow-output-path>
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');

const OUTPUT_PATH = process.argv[2];
if (!OUTPUT_PATH) {
  console.error('Usage: node scripts/_persist-parts-seed.js <workflow-output-path>');
  process.exit(1);
}
if (!fs.existsSync(OUTPUT_PATH)) {
  console.error(`Workflow output not found at: ${OUTPUT_PATH}`);
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
});
pool.on('error', () => {});

const THIS_SOURCE = 'workflow-seed';
// Higher = more trustworthy. Unknown sources rank low-ish (20) so a genuinely
// unlabeled row can still be replaced by a real seed, but production wins.
const SOURCE_RANK = {
  'production-confirmed': 100,
  pipeline: 60,
  'pipeline-freetext': 55,
  'workflow-seed': 40,
  static: 30,
  ai: 10,
};
function rank(s) { return SOURCE_RANK[String(s || '')] ?? 20; }

function cleanParts(parts) {
  return (Array.isArray(parts) ? parts : [])
    .filter((p) => p && typeof p.name === 'string' && p.name.trim())
    .map((p) => ({
      name: String(p.name),
      spec: String(p.spec || ''),
      detail: p.detail ? String(p.detail) : undefined,
      partNumber: p.partNumber ? String(p.partNumber) : undefined,
      searchQuery: String(p.searchQuery || p.name),
    }));
}

async function main() {
  // Idempotent, additive metadata columns (the app never reads these).
  await pool.query(`ALTER TABLE "VehiclePartLookup"
    ADD COLUMN IF NOT EXISTS "confirmationCount" integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS "lastConfirmedAt" timestamptz`);

  const payload = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
  const vehicles = payload?.result?.vehicles || [];
  const stats = payload?.result?.stats || {};
  console.log(`Workflow stats: ${JSON.stringify(stats)}`);
  console.log(`Vehicles to persist: ${vehicles.length}\n`);

  const NEW_RANK = rank(THIS_SOURCE);
  let inserted = 0, reconfirmed = 0, protectedRows = 0, skippedEmpty = 0;
  const perVehicle = [];

  for (const v of vehicles) {
    if (!v || !v.year || !v.make || !v.model) continue;
    const trim = v.trim || 'Base';
    let n = 0, prot = 0;
    for (const r of v.results || []) {
      const parts = cleanParts(r.parts);
      if (parts.length === 0) { skippedEmpty++; continue; }
      const key = [v.year, v.make, v.model, trim, r.task];
      const existing = await pool.query(
        `SELECT source FROM "VehiclePartLookup" WHERE year=$1 AND make=$2 AND model=$3 AND trim=$4 AND task=$5`,
        key,
      );
      if (existing.rowCount === 0) {
        await pool.query(
          `INSERT INTO "VehiclePartLookup" (id, year, make, model, trim, task, parts, source, status, "confirmationCount", "lastConfirmedAt", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'pending', 1, NOW(), NOW(), NOW())`,
          [...key, JSON.stringify(parts), THIS_SOURCE],
        );
        inserted++; n++;
      } else if (NEW_RANK >= rank(existing.rows[0].source)) {
        // Equal-or-lower-trust row → overwrite + record a fresh confirmation.
        await pool.query(
          `UPDATE "VehiclePartLookup"
             SET parts=$6, source=$7, "confirmationCount"="confirmationCount"+1, "lastConfirmedAt"=NOW(), "updatedAt"=NOW()
           WHERE year=$1 AND make=$2 AND model=$3 AND trim=$4 AND task=$5`,
          [...key, JSON.stringify(parts), THIS_SOURCE],
        );
        reconfirmed++; n++;
      } else {
        // Higher-trust row (pipeline / production-confirmed) → do NOT clobber.
        protectedRows++; prot++;
      }
    }
    perVehicle.push(`  ${v.year} ${v.make} ${v.model} ${trim}: ${n} written${prot ? `, ${prot} protected` : ''}`);
  }

  console.log(perVehicle.join('\n'));
  console.log('\n━━━ Parts seed complete (source=workflow-seed) ━━━');
  console.log(`  Inserted (new):            ${inserted}`);
  console.log(`  Overwrote + re-confirmed:  ${reconfirmed}`);
  console.log(`  Protected (higher-trust):  ${protectedRows}`);
  console.log(`  Skipped (empty/N-A tasks): ${skippedEmpty}`);
  console.log('\nReview:  SELECT year,make,model,trim,task,source,"confirmationCount","lastConfirmedAt" FROM "VehiclePartLookup" WHERE source=\'workflow-seed\';');
  console.log('Revert:  DELETE FROM "VehiclePartLookup" WHERE source=\'workflow-seed\';');

  await pool.end();
}

main().catch((err) => { console.error('FAIL:', err.message); pool.end(); process.exit(1); });
