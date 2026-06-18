require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
(async () => {
  const rows = await prisma.knownIssue.findMany({
    where: { make: 'Opel', status: 'published' },
    select: { model: true, title: true },
    orderBy: { model: 'asc' },
  });
  for (const r of rows) console.log(`${r.model} ::: ${r.title}`);
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
