require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const TARGETS = [
  ['Renault','Clio'],['Renault','Megane'],['Renault','Captur'],
  ['Peugeot','206'],['Peugeot','208'],['Peugeot','308'],['Peugeot','3008'],
  ['Citroen','C3'],['Citroen','C4'],
  ['Maruti Suzuki','Swift'],['Suzuki','Swift'],['Tata','Nexon'],['Mahindra','Scorpio'],
  ['Hyundai','i20'],['Hyundai','Creta'],
];
(async () => {
  for (const [make, model] of TARGETS) {
    const rows = await prisma.knownIssue.findMany({
      where: { make: { contains: make, mode: 'insensitive' }, model: { equals: model, mode: 'insensitive' } },
      select: { title: true, years: true, status: true, make: true },
    });
    console.log(make + ' ' + model + ': ' + rows.length + ' existing');
    for (const r of rows) console.log('  [' + r.status + '] (' + r.make + ') ' + r.title);
  }
  const makes = await prisma.knownIssue.groupBy({ by: ['make'], _count: true });
  console.log('\nAll makes: ' + makes.map(m => m.make).sort().join(', '));
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
