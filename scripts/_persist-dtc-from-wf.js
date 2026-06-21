// Persist DTC reference rows from a Workflow output file.
// The workflow returns { rows: [...] } (top level), each row:
//   { code, name, system, description, commonCauses[], symptoms[], severity }
// Upserts into DTCCode: existing codes are ENRICHED (updated), new ones inserted.
// AI-free + idempotent. Usage: node scripts/_persist-dtc-from-wf.js <output.json>
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const VALID_CODE = /^[PBCU][0-3][0-9A-F]{3}$/i; // standard 5-char DTC format

(async () => {
  const wrap = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const rows = Array.isArray(wrap.rows) ? wrap.rows
    : Array.isArray(wrap.confirmed) ? wrap.confirmed
    : (wrap.result && Array.isArray(wrap.result.rows)) ? wrap.result.rows
    : [];
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  let ins = 0, upd = 0, skip = 0;
  for (const r of rows) {
    const code = String(r.code || '').toUpperCase().trim();
    if (!VALID_CODE.test(code) || !r.name) { skip++; continue; }
    if (r.confident === false) { skip++; continue; }
    const causes = Array.isArray(r.commonCauses) ? r.commonCauses.map(String) : [];
    const sym = Array.isArray(r.symptoms) ? r.symptoms.map(String) : [];
    // Fold symptoms into description tail if the model has no symptoms column —
    // keep it simple + schema-safe (mirror _persist-dtc-rows.js field set).
    const data = {
      name: String(r.name).slice(0, 200),
      system: String(r.system || 'Powertrain').slice(0, 60),
      description: String(r.description || ''),
      commonCauses: causes,
      severity: ['high', 'medium', 'low'].includes(r.severity) ? r.severity : 'medium',
    };
    try {
      const existing = await prisma.dTCCode.findUnique({ where: { code }, select: { code: true } });
      if (existing) { upd++; continue; } // insert-only: never overwrite existing curated content
      await prisma.dTCCode.create({ data: { code, ...data } }); ins++;
    } catch (e) { console.error('  ! ' + code + ': ' + e.message); skip++; }
    void sym;
  }
  console.log('\nDTC persist: inserted ' + ins + ', updated ' + upd + ', skipped ' + skip + ' (of ' + rows.length + ')');
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
