require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'pending_review' },
    select: {
      id: true, make: true, model: true, years: true, title: true,
      severity: true, citations: true, dtcCodes: true, updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
  console.log(`Total pending_review: ${rows.length}\n`);
  for (const r of rows) {
    const cites = Array.isArray(r.citations) ? r.citations : [];
    console.log(`[${r.severity}] ${r.id}`);
    console.log(`  ${r.make} ${r.model} (${(r.years || []).join(',')}) — ${r.title}`);
    console.log(`  citations: ${cites.length}, dtcs: ${(r.dtcCodes || []).length}, updated: ${r.updatedAt.toISOString().slice(0,16)}`);
    for (const c of cites) {
      const url = c.url ? c.url.slice(0, 80) : '(no url)';
      console.log(`    • [${c.type}] ${(c.title || '').slice(0,60)} — ${url}`);
    }
    console.log('');
  }
  await prisma.$disconnect();
  await pool.end();
})().catch(e => { console.error('FAIL:', e); process.exit(1); });
