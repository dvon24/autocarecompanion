require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
(async () => {
  const id = 'ram-1500-3-0l-ecodiesel-egr-cooler-cracks-internally-causing-intake-f';
  const r = await prisma.knownIssue.update({ where: { id }, data: { status: 'archived' } }).catch(e => ({ err: e.message }));
  console.log(r.err ? 'archive failed: '+r.err : 'archived dupe: '+id);
  const total = await prisma.knownIssue.count({ where: { status: 'published' } });
  const tonight = await prisma.knownIssue.count({ where: { status: 'published', createdAt: { gt: new Date(Date.now()-4*3600000) } } });
  console.log('Published total:', total, '| published in last 4h:', tonight);
  await prisma.$disconnect(); await pool.end();
})();
