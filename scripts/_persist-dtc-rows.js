require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
(async () => {
  const wrap = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const rows = (wrap.result && wrap.result.result && wrap.result.result.rows) || [];
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  let ins = 0, upd = 0, skip = 0;
  for (const r of rows) {
    const code = String(r.code || '').toUpperCase().trim();
    if (!code || !r.name) { skip++; continue; }
    // skip unknowns the model couldn't define
    if (r.confident === false && /^manufacturer-specific code/i.test(r.name)) { skip++; continue; }
    const data = {
      name: String(r.name).slice(0, 200),
      system: String(r.system || 'Other'),
      description: String(r.description || ''),
      commonCauses: Array.isArray(r.commonCauses) ? r.commonCauses.map(String) : [],
      severity: ['high','medium','low'].includes(r.severity) ? r.severity : 'medium',
    };
    const existing = await prisma.dTCCode.findUnique({ where: { code }, select: { code: true } });
    if (existing) { await prisma.dTCCode.update({ where: { code }, data }); upd++; }
    else { await prisma.dTCCode.create({ data: { code, ...data } }); ins++; }
  }
  console.log(`DTC persist: inserted ${ins}, updated ${upd}, skipped ${skip} (of ${rows.length})`);
  await prisma.$disconnect(); await pool.end();
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
