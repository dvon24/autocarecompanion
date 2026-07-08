require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
(async () => {
  const rows = await prisma.feedback.findMany({
    where: { email: { in: ['barnardfamily@sbcglobal.net', 'dymsail@whidbey.com'] } },
    orderBy: { createdAt: 'desc' },
  });
  for (const r of rows) {
    console.log(`--- ${r.email} (${r.kind}) ${r.createdAt.toISOString()} ---`);
    console.log(`message (len=${r.message.length}): ${JSON.stringify(r.message)}`);
    console.log(`meta: ${JSON.stringify(r.meta)}`);
  }
  console.log(`\nRows found: ${rows.length}`);
  await prisma.$disconnect(); await pool.end();
})();
