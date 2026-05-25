require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

async function check() {
  const issues = await p.knownIssue.findMany({
    where: { make: 'Chevrolet', model: 'Camaro', status: 'published' },
    select: { id: true, title: true, years: true },
  });
  console.log('ALL Camaro issues:', issues.length);
  const for2019 = issues.filter(i => i.years.includes(2019));
  console.log('With 2019 in years[]:', for2019.length);
  const not2019 = issues.filter(i => i.years.includes(2019) === false);
  console.log('WITHOUT 2019:', not2019.length);
  if (not2019.length > 0) {
    not2019.slice(0, 5).forEach(i => console.log('  -', i.id, '| years:', JSON.stringify(i.years)));
  }

  // Also check: does the API query actually use has?
  const apiResult = await p.knownIssue.findMany({
    where: {
      make: { equals: 'Chevrolet', mode: 'insensitive' },
      model: { contains: 'Camaro', mode: 'insensitive' },
      years: { has: 2019 },
      status: 'published',
    },
    select: { id: true },
  });
  console.log('\nPrisma query with years:{has:2019}:', apiResult.length, 'results');

  const apiAll = await p.knownIssue.findMany({
    where: {
      make: { equals: 'Chevrolet', mode: 'insensitive' },
      model: { contains: 'Camaro', mode: 'insensitive' },
      status: 'published',
    },
    select: { id: true },
  });
  console.log('Prisma query WITHOUT year filter:', apiAll.length, 'results');

  await p.$disconnect();
  pool.end();
}
check();
