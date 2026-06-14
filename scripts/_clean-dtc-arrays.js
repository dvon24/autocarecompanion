#!/usr/bin/env node
/* eslint-disable */
/**
 * Clean KnownIssue.dtcCodes arrays: research agents occasionally wrote
 * free-text prose into the codes array ("multiple U-codes from low-voltage
 * events", "Code 22", "01435 Brake Pressure Sensor 1 (G201): ...").
 * Prose breaks the DTC cross-linking and looks broken in the UI chip list.
 *
 * Keeps entries matching real code formats:
 *   - OBD-II standard + extended:  P0421, P20E8, P0AA6:00, P052E71, P0B2900
 *   - BMW hex:                     2E84, 377A, C110BF0
 *   - VAG 5-digit:                 17114, 01276, 65535
 *   - Pre-OBD flash codes (1-2 digits): 12, 13, 22
 * For prose entries, salvages a leading code token when present
 * ("01435 Brake Pressure Sensor..." -> "01435", "Code 22" -> "22"),
 * otherwise drops the entry.
 *
 * Usage: node scripts/_clean-dtc-arrays.js [--dry-run]
 */
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const dryRun = process.argv.includes('--dry-run');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});

const CODE_RE = /^(?:[PBCU][0-9A-F]{4,6}(?::[0-9A-F]{2})?|[0-9A-F]{4,8}|[0-9]{5}|[0-9]{1,2})$/i;

function extractCode(entry) {
  const s = String(entry || '').trim();
  if (CODE_RE.test(s)) return s.toUpperCase();
  // Salvage a leading code token: "01435 Brake Pressure ..." / "Code 22"
  const tokens = s.replace(/^code\s+/i, '').split(/[\s,(:—-]+/);
  const first = (tokens[0] || '').trim();
  if (first && CODE_RE.test(first) && first.length >= 2) return first.toUpperCase();
  return null;
}

(async () => {
  const rows = (await pool.query(`SELECT id, "dtcCodes" FROM "KnownIssue" WHERE array_length("dtcCodes", 1) > 0`)).rows;
  let changed = 0, droppedTotal = 0;
  for (const r of rows) {
    const cleaned = [...new Set(r.dtcCodes.map(extractCode).filter(Boolean))];
    const dropped = r.dtcCodes.length - cleaned.length;
    const sameContent = cleaned.length === r.dtcCodes.length && cleaned.every((c, i) => c === r.dtcCodes[i]);
    if (sameContent) continue;
    changed++;
    droppedTotal += Math.max(0, dropped);
    if (changed <= 20 || dropped > 0) {
      console.log(`${r.id}`);
      console.log(`  before: ${JSON.stringify(r.dtcCodes)}`);
      console.log(`  after:  ${JSON.stringify(cleaned)}`);
    }
    if (!dryRun) {
      await pool.query(`UPDATE "KnownIssue" SET "dtcCodes" = $1, "updatedAt" = NOW() WHERE id = $2`, [cleaned, r.id]);
    }
  }
  console.log(`\n${dryRun ? 'DRY RUN — ' : ''}${changed} rows cleaned, ${droppedTotal} prose entries dropped/salvaged (of ${rows.length} rows with codes)`);
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
