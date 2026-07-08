require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
(async () => {
  const since = new Date(Date.now() - 7*3600000);
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published', source: 'ai-researched', createdAt: { gt: since }, confidence: 'low' },
    select: { make: true, model: true, years: true, title: true, description: true, citations: true },
    orderBy: [{ make: 'asc' }],
  });
  console.log(`=== ${rows.length} LOW-CONFIDENCE issues published tonight ===\n`);
  rows.forEach((r, i) => {
    const cits = Array.isArray(r.citations)?r.citations:[];
    console.log(`${i+1}. ${r.make} ${r.model} (${(r.years||[]).join(',')})`);
    console.log(`   ${r.title}`);
    console.log(`   ${String(r.description||'').slice(0,180)}...`);
    cits.forEach(c => console.log(`     [${c.type}] ${c.url}`));
    console.log('');
  });
  await prisma.$disconnect(); await pool.end();
})();
