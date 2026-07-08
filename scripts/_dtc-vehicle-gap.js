require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const CODES = ['P0300','P0171','P0174','P0420','P0430','P0128','P0442','P0455','P0700','P0741','P0016','P0011','P0301','P0302','P0303'];
const VEHICLES = [['Ford','F-150'],['Chevrolet','Silverado 1500'],['RAM','1500'],['Toyota','Camry'],['Toyota','Corolla'],['Toyota','RAV4'],['Honda','CR-V'],['Honda','Civic'],['Honda','Accord'],['Nissan','Rogue'],['Nissan','Altima'],['Ford','Escape'],['Ford','Explorer'],['Chevrolet','Equinox'],['Chevrolet','Malibu'],['Jeep','Wrangler'],['Jeep','Grand Cherokee'],['Toyota','Tacoma'],['Ford','Mustang'],['Hyundai','Sonata'],['Hyundai','Elantra'],['Kia','Sorento'],['Subaru','Outback'],['Nissan','Sentra'],['GMC','Sierra 1500']];
(async () => {
  let gaps = 0, covered = 0;
  const gapList = [];
  for (const [make, model] of VEHICLES) {
    const rows = await prisma.$queryRawUnsafe(`SELECT DISTINCT unnest("dtcCodes") c FROM "KnownIssue" WHERE status='published' AND make ILIKE $1 AND model ILIKE $2`, make, model);
    const have = new Set(rows.map(r => r.c));
    for (const code of CODES) {
      if (have.has(code)) covered++; else { gaps++; gapList.push(`${code} ${make} ${model}`); }
    }
  }
  console.log(`Matrix: ${CODES.length} top codes x ${VEHICLES.length} popular vehicles = ${CODES.length*VEHICLES.length} combos`);
  console.log(`Already have a code-tagged issue: ${covered}`);
  console.log(`GAPS (no issue for that code+vehicle): ${gaps}`);
  console.log('\nSample gaps:', gapList.slice(0,20).join(' | '));
  await prisma.$disconnect(); await pool.end();
})();
