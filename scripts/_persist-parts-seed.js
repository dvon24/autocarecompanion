#!/usr/bin/env node
/**
 * Persist a parts-seed research workflow's output into VehiclePartLookup.
 *
 * EXPLICITLY ZERO AI CALLS — pure pg writes. Reads the workflow .output
 * (payload.result.vehicles = [{year, make, model, trim, results:[{task,parts}]}]),
 * upserts one VehiclePartLookup row per (year,make,model,trim,task).
 *
 * Tagged source='workflow-seed' so the whole batch is reviewable / revertable
 * as one unit:  DELETE FROM "VehiclePartLookup" WHERE source='workflow-seed';
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
  const payload = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
  const vehicles = payload?.result?.vehicles || [];
  const stats = payload?.result?.stats || {};
  console.log(`Workflow stats: ${JSON.stringify(stats)}`);
  console.log(`Vehicles to persist: ${vehicles.length}\n`);

  let upserts = 0;
  let skippedEmpty = 0;
  const perVehicle = [];

  for (const v of vehicles) {
    if (!v || !v.year || !v.make || !v.model) continue;
    const trim = v.trim || 'Base';
    let n = 0;
    for (const r of v.results || []) {
      const parts = cleanParts(r.parts);
      if (parts.length === 0) { skippedEmpty++; continue; }
      await pool.query(
        `INSERT INTO "VehiclePartLookup" (id, year, make, model, trim, task, parts, source, status, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'workflow-seed', 'pending', NOW(), NOW())
         ON CONFLICT (year, make, model, trim, task)
         DO UPDATE SET parts = $6, source = 'workflow-seed', "updatedAt" = NOW()`,
        [v.year, v.make, v.model, trim, r.task, JSON.stringify(parts)],
      );
      upserts++; n++;
    }
    perVehicle.push(`  ${v.year} ${v.make} ${v.model} ${trim}: ${n} tasks`);
  }

  console.log(perVehicle.join('\n'));
  console.log('\n━━━ Parts seed complete (source=workflow-seed) ━━━');
  console.log(`  Upserted task-entries: ${upserts}`);
  console.log(`  Skipped (empty/N-A tasks): ${skippedEmpty}`);
  console.log('\nReview:  SELECT year,make,model,trim,task FROM "VehiclePartLookup" WHERE source=\'workflow-seed\';');
  console.log('Revert:  DELETE FROM "VehiclePartLookup" WHERE source=\'workflow-seed\';');

  await pool.end();
}

main().catch((err) => { console.error('FAIL:', err.message); pool.end(); process.exit(1); });
