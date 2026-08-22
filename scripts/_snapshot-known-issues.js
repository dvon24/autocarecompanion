#!/usr/bin/env node
/**
 * Read-only snapshot of KnownIssue state, for before/after comparison around a deploy.
 *   node scripts/_snapshot-known-issues.js <label>
 * Writes data/_snapshot-<label>.json and prints a summary. ZERO writes, ZERO AI.
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');
const label = process.argv[2] || 'snap';
const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!connectionString) throw new Error('No POSTGRES_PRISMA_URL, DATABASE_URL, or DIRECT_URL is configured.');
const pool = new Pool({ connectionString, max: 2 });
pool.on('error', () => {});
(async () => {
  const status = (await pool.query(`SELECT status, COUNT(*)::int n FROM "KnownIssue" GROUP BY status`)).rows;
  const pending = (await pool.query(`SELECT id, make, model FROM "KnownIssue" WHERE status='pending_review' ORDER BY id`)).rows;
  const fixParts = (await pool.query(`SELECT COUNT(*)::int n FROM "KnownIssue" WHERE "fixParts"::text NOT IN ('[]','null')`)).rows[0].n;
  const byMakeW2 = (await pool.query(
    `SELECT make, COUNT(*) FILTER (WHERE status='published')::int pub, COUNT(*)::int all_rows
     FROM "KnownIssue" WHERE make IN ('Volvo','MINI','Buick','Cadillac','Mitsubishi','Infiniti','Lexus')
     GROUP BY make ORDER BY make`)).rows;
  const snap = { label, takenAt: new Date().toISOString(), status, pendingCount: pending.length, pendingIds: pending.map(p => p.id), fixParts, byMake: byMakeW2 };
  fs.writeFileSync(`data/_snapshot-${label}.json`, JSON.stringify(snap, null, 2));
  console.log(`snapshot "${label}" @ ${snap.takenAt}`);
  console.log('  status      :', status.map(r => `${r.status}=${r.n}`).join('  '));
  console.log('  pending rows:', pending.length);
  console.log('  fixParts    :', fixParts);
  console.log('  target makes:');
  byMakeW2.forEach(r => console.log(`    ${r.make.padEnd(12)} published ${String(r.pub).padStart(4)}   total ${r.all_rows}`));
  console.log(`\nwrote data/_snapshot-${label}.json`);
  await pool.end();
})().catch(e => {
  console.error('FAIL:', e && (e.message || e.code) ? (e.message || e.code) : String(e));
  if (Array.isArray(e && e.errors)) {
    for (const nested of e.errors) console.error('  ', nested.code || 'error', nested.message || String(nested));
  }
  pool.end();
  process.exitCode = 1;
});
