require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const targets = [
  { make: 'Mazda', model: 'CX-60' },
  { make: 'Ford', model: 'Maverick' },
  { make: 'Cadillac', model: 'CT5' },
];

(async () => {
  for (const t of targets) {
    const all = await prisma.knownIssue.findMany({
      where: { make: { equals: t.make, mode: 'insensitive' }, model: { equals: t.model, mode: 'insensitive' } },
      select: {
        id: true, title: true, years: true, severity: true, status: true, confidence: true, source: true,
        citations: true, dtcCodes: true, category: true,
      },
    });
    console.log(`\n=== ${t.make} ${t.model}: ${all.length} total ===`);
    const byStatus = all.reduce((acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc; }, {});
    console.log(`By status: ${JSON.stringify(byStatus)}`);
    for (const i of all) {
      const cites = Array.isArray(i.citations) ? i.citations.length : 0;
      console.log(`[${i.status}] (${i.category}) sev=${i.severity} cites=${cites} yrs=[${(i.years || []).join(',')}]  ${i.title}`);
    }
  }
  await prisma.$disconnect();
  await pool.end();
})().catch(e => { console.error('FAIL:', e); process.exit(1); });
