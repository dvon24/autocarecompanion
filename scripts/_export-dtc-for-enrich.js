#!/usr/bin/env node
/**
 * Export the DTC codes that have LIVE pages (appear in >=1 published
 * KnownIssue) with their current reference data, so a subscription
 * workflow can enrich thin descriptions / common-causes. ZERO AI calls.
 *
 * Writes data/dtc-to-enrich.json: [{code, name, system, severity,
 * description, commonCauses, descLen}]  (sorted thinnest-first).
 *
 * Usage: node scripts/_export-dtc-for-enrich.js
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});

async function main() {
  // Codes that appear in at least one published issue (these have real pages).
  const inIssues = await pool.query(`
    SELECT DISTINCT upper(dtc) AS code
    FROM (SELECT unnest("dtcCodes") AS dtc FROM "KnownIssue" WHERE status='published') s
    WHERE dtc ~ '^[CPUB][0-9A-F]{4,5}$'
  `);
  const codes = inIssues.rows.map((r) => r.code);
  if (codes.length === 0) { console.log('No DTC codes in published issues.'); await pool.end(); return; }

  const ref = await pool.query(
    `SELECT code, name, system, severity, description, "commonCauses"
     FROM "DTCCode" WHERE code = ANY($1) ORDER BY code`,
    [codes],
  );

  const out = ref.rows.map((r) => ({
    code: r.code,
    name: r.name,
    system: r.system,
    severity: r.severity,
    description: r.description || '',
    commonCauses: Array.isArray(r.commonCauses) ? r.commonCauses : [],
    descLen: (r.description || '').length,
    causeCount: (Array.isArray(r.commonCauses) ? r.commonCauses : []).length,
  })).sort((a, b) => a.descLen - b.descLen);

  const outPath = path.join(__dirname, '..', 'data', 'dtc-to-enrich.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

  const thin = out.filter((d) => d.descLen < 160 || d.causeCount < 4).length;
  console.log(`Codes with live pages: ${out.length}`);
  console.log(`  Thin (desc<160 chars OR <4 causes): ${thin}`);
  console.log(`  Avg description length: ${Math.round(out.reduce((s, d) => s + d.descLen, 0) / out.length)} chars`);
  console.log(`  Wrote -> ${outPath}`);
  console.log('\nThinnest 5:');
  out.slice(0, 5).forEach((d) => console.log(`  ${d.code} (${d.descLen} chars, ${d.causeCount} causes): ${d.name}`));

  await pool.end();
}

main().catch((err) => { console.error('FAIL:', err.message); pool.end(); process.exit(1); });
