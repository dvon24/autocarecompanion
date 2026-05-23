#!/usr/bin/env node
/**
 * List all pending_review issues (the queue for audit-before-publish).
 *
 * Output is formatted so a Claude Code session can read it, run
 * WebSearch verification on each, and then pass verified IDs to
 * scripts/publish-verified-issues.js.
 *
 * Usage:
 *   node scripts/list-pending-issues.js                # all
 *   node scripts/list-pending-issues.js --make Opel    # filter by make
 *   node scripts/list-pending-issues.js --json         # JSON output
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const args = process.argv.slice(2);
const makeFilter = args.includes('--make') ? args[args.indexOf('--make') + 1] : null;
const jsonOut = args.includes('--json');

async function main() {
  const params = [];
  let sql = `SELECT id, make, model, years, trims, engines, category, title, description, "dtcCodes", severity FROM "KnownIssue" WHERE status='pending_review'`;
  if (makeFilter) {
    sql += ` AND make ILIKE $1`;
    params.push(makeFilter);
  }
  sql += ` ORDER BY make, model, id`;
  const rows = (await pool.query(sql, params)).rows;

  if (jsonOut) {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    console.log(`═══════════════════════════════════════════════════════════`);
    console.log(`  Pending Review (${rows.length} issues)`);
    if (makeFilter) console.log(`  Filter: make ILIKE "${makeFilter}"`);
    console.log(`═══════════════════════════════════════════════════════════\n`);
    let lastMake = null;
    for (const r of rows) {
      if (r.make !== lastMake) {
        console.log(`\n━━━ ${r.make} ━━━`);
        lastMake = r.make;
      }
      const ys = (r.years || []).length ? `${Math.min(...r.years)}-${Math.max(...r.years)}` : 'unknown';
      console.log(`  ${r.id}`);
      console.log(`    ${ys} ${r.model} (${r.severity}) — ${r.title}`);
      console.log(`    ${r.description.slice(0, 140)}${r.description.length > 140 ? '...' : ''}`);
      if (r.dtcCodes && r.dtcCodes.length) console.log(`    DTCs: ${r.dtcCodes.join(', ')}`);
    }
    console.log(`\n${rows.length} pending. Audit then publish via scripts/publish-verified-issues.js`);
  }

  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
