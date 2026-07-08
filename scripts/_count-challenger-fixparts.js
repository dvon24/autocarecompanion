require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
(async () => {
  try {
    const total = await prisma.knownIssue.count({ where: { make:{equals:'Dodge',mode:'insensitive'}, model:{equals:'Challenger',mode:'insensitive'}, status:'published' } });
    const withParts = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "KnownIssue" WHERE make ILIKE 'Dodge' AND model ILIKE 'Challenger' AND status='published' AND "fixParts" IS NOT NULL AND "fixParts"::text <> '[]' AND "fixParts"::text <> 'null'`);
    console.log('Challenger published issues:', total, '| with fixParts:', withParts[0].n);
    const sample = await prisma.$queryRawUnsafe(`SELECT title, "fixParts" FROM "KnownIssue" WHERE make ILIKE 'Dodge' AND model ILIKE 'Challenger' AND status='published' AND "fixParts" IS NOT NULL AND "fixParts"::text <> '[]' LIMIT 1`);
    if (sample[0]) { console.log('\nSAMPLE issue:', sample[0].title); console.log('fixParts:', JSON.stringify(sample[0].fixParts, null, 2).slice(0, 900)); }
  } catch (e) { console.error('ERR', e.message); }
  finally { await prisma.$disconnect(); await pool.end(); }
})();
